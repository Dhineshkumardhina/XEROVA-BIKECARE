import { useAuth } from './useAuth';

export const usePermission = () => {
  const { user, hasPermission } = useAuth();

  return {
    user,
    can: hasPermission,
    isSuperAdmin: user?.role === 'SUPER_ADMIN' || user?.role === 'store_admin',
    isManager: user?.role === 'MANAGER' || user?.role === 'manager',
    isBillingOperator: user?.role === 'BILLING_OPERATOR' || user?.role === 'billing_operator'
  };
};
