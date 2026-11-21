import UnifiedLoginPage from '@/components/auth/UnifiedLoginPage';

export const metadata = {
  title: 'Teacher & Faculty Login | Nexaweb Education',
  description: 'Sign in with your faculty credentials to manage daily attendance, grade entries, and routines.',
};

export default function TeacherLoginPage() {
  return <UnifiedLoginPage initialRole="TEACHER" />;
}
