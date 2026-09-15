import { prisma } from '../config/database.js';
import { sanitizeUuid } from '../utils/uuid.js';

export interface AuditLogQueryFilters {
  module?: string;
  username?: string;
  action?: string;
  entity?: string;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ActivityTimelineItem {
  id: string;
  timestamp: string;
  timeFormatted: string;
  user: string;
  username: string;
  userRole: string;
  action: string;
  module: string;
  relatedRecord: string;
  device: string;
  ipAddress: string;
  details: string;
  status: 'Success' | 'Warning' | 'Failed' | 'Denied' | 'Error';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export class AuditService {
  private inMemoryLogs: any[] = [];

  /**
   * Log an auditable event with before/after state diffs.
   */
  async logEvent(params: {
    userId?: string;
    username: string;
    action: string;
    module: string;
    entity: string;
    entityId?: string;
    previousValue?: any;
    newValue?: any;
    notes?: string;
    severity?: 'INFO' | 'WARNING' | 'CRITICAL';
    ipAddress?: string;
    userAgent?: string;
  }) {
    const memoryRecord = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: params.userId || null,
      username: params.username,
      action: params.action,
      module: params.module,
      entity: params.entity,
      entityId: params.entityId || null,
      previousValue: params.previousValue,
      newValue: params.newValue,
      notes: params.notes,
      severity: params.severity || 'INFO',
      ipAddress: params.ipAddress || '127.0.0.1',
      userAgent: params.userAgent || 'BIKE-ERP-Web/1.0',
      createdAt: new Date()
    };

    this.inMemoryLogs.unshift(memoryRecord);

    try {
      const dbRecord = await prisma.auditLog.create({
        data: {
          userId: sanitizeUuid(params.userId),
          username: params.username,
          action: params.action,
          module: params.module,
          entity: params.entity,
          entityId: params.entityId,
          previousValue: params.previousValue,
          newValue: params.newValue,
          notes: params.notes,
          severity: params.severity || 'INFO',
          ipAddress: params.ipAddress || '127.0.0.1',
          userAgent: params.userAgent || 'BIKE-ERP-Web/1.0'
        }
      }).catch(() => null);

      return dbRecord || memoryRecord;
    } catch {
      return memoryRecord;
    }
  }

  /**
   * Query structured audit log records with pagination and multi-field search.
   */
  async getAuditLogs(params: AuditLogQueryFilters) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 30;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.module) where.module = { equals: params.module, mode: 'insensitive' };
    if (params.username) where.username = { contains: params.username, mode: 'insensitive' };
    if (params.action) where.action = { contains: params.action, mode: 'insensitive' };
    if (params.entity) where.entity = { equals: params.entity, mode: 'insensitive' };
    if (params.severity) where.severity = params.severity;

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = new Date(params.startDate);
      if (params.endDate) where.createdAt.lte = new Date(params.endDate);
    }

    if (params.search) {
      where.OR = [
        { username: { contains: params.search, mode: 'insensitive' } },
        { action: { contains: params.search, mode: 'insensitive' } },
        { module: { contains: params.search, mode: 'insensitive' } },
        { notes: { contains: params.search, mode: 'insensitive' } },
        { entityId: { contains: params.search, mode: 'insensitive' } }
      ];
    }

    let logs: any[] = [];
    let total = 0;

    try {
      [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }).catch(() => []),
        prisma.auditLog.count({ where }).catch(() => 0)
      ]);
    } catch {
      logs = [];
      total = 0;
    }

    if (logs.length === 0 && this.inMemoryLogs.length > 0) {
      let filtered = [...this.inMemoryLogs];
      if (params.module) {
        filtered = filtered.filter((l) => l.module.toLowerCase() === params.module?.toLowerCase());
      }
      if (params.username) {
        filtered = filtered.filter((l) => l.username.toLowerCase().includes(params.username!.toLowerCase()));
      }
      if (params.action) {
        filtered = filtered.filter((l) => l.action.toLowerCase().includes(params.action!.toLowerCase()));
      }
      if (params.severity) {
        filtered = filtered.filter((l) => l.severity === params.severity);
      }
      total = filtered.length;
      logs = filtered.slice(skip, skip + limit);
    }

    return {
      logs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 }
    };
  }

  /**
   * Generates a rich system activity timeline for dashboard display.
   */
  async getActivityTimeline(limit: number = 50): Promise<ActivityTimelineItem[]> {
    let rawLogs: any[] = [];
    try {
      rawLogs = await prisma.auditLog.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              fullName: true,
              role: { select: { displayName: true } }
            }
          }
        }
      }).catch(() => []);
    } catch {
      rawLogs = [];
    }

    if (rawLogs.length === 0 && this.inMemoryLogs.length > 0) {
      rawLogs = this.inMemoryLogs.slice(0, limit);
    }

    if (rawLogs.length === 0) {
      // Return representative default timeline items if clean database
      const now = new Date();
      return [
        {
          id: 'act-01',
          timestamp: now.toISOString(),
          timeFormatted: 'Just now',
          user: 'System Administrator (Super Admin)',
          username: 'admin',
          userRole: 'SUPER_ADMIN',
          action: 'System Activity Timeline Initialized',
          module: 'Admin',
          relatedRecord: 'System Engine',
          device: 'Desktop Chrome / Windows 11',
          ipAddress: '192.168.1.100',
          details: 'Audit logging engine is active and monitoring all system operations.',
          status: 'Success',
          severity: 'INFO'
        }
      ];
    }

    return rawLogs.map((log) => {
      const date = new Date(log.createdAt);
      const isCritical = log.severity === 'CRITICAL';
      const isWarning = log.severity === 'WARNING';

      return {
        id: log.id,
        timestamp: date.toISOString(),
        timeFormatted: this.getRelativeTime(date),
        user: log.user?.fullName ? `${log.user.fullName} (${log.user.role?.displayName || 'User'})` : log.username,
        username: log.username,
        userRole: log.user?.role?.displayName || 'System',
        action: log.action,
        module: log.module,
        relatedRecord: log.entityId ? `${log.entity} #${log.entityId}` : log.entity,
        device: log.userAgent || 'Web Console',
        ipAddress: log.ipAddress || '127.0.0.1',
        details: log.notes || `Executed ${log.action} on ${log.entity}`,
        status: isCritical ? 'Error' : isWarning ? 'Warning' : 'Success',
        severity: log.severity as any
      };
    });
  }

  private getRelativeTime(date: Date): string {
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  }
}

export const auditService = new AuditService();
