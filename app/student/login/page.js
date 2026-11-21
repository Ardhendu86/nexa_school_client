import UnifiedLoginPage from '@/components/auth/UnifiedLoginPage';

export const metadata = {
  title: 'Student & Guardian Login | Nexaweb Education',
  description: 'Sign in to access academic mark sheets, attendance percentages, fees, and lecture notices.',
};

export default function StudentLoginPage() {
  return <UnifiedLoginPage initialRole="STUDENT" />;
}
