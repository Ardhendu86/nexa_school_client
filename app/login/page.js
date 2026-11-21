import UnifiedLoginPage from '@/components/auth/UnifiedLoginPage';

export const metadata = {
  title: 'Institutional Portal Login | Nexaweb Education',
  description: 'Multi-role authentication portal for Admin, Teacher, and Student access.',
};

export default function LoginPage() {
  return <UnifiedLoginPage initialRole="ADMIN" />;
}
