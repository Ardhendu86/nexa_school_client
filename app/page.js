import UnifiedLoginPage from '@/components/auth/UnifiedLoginPage';

export const metadata = {
  title: 'Sign In to Your Portal | Nexaweb Education',
  description: 'Enterprise School Management System with immediate Admin, Teacher, and Student authentication options.',
};

export default function RootPage() {
  return <UnifiedLoginPage initialRole="ADMIN" />;
}
