import UnifiedLoginPage from '@/components/auth/UnifiedLoginPage';

export const metadata = {
  title: 'Administrator Login | Nexaweb Education',
  description: 'Sign in to access administrative operations, user permissions, and institutional records.',
};

export default function AdminLoginPage() {
  return <UnifiedLoginPage initialRole="ADMIN" />;
}
