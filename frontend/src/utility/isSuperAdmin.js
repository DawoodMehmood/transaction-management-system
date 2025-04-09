export const isSuperAdmin = () => {
   const user = JSON.parse(localStorage.getItem('user'));
  // Check if user exists and if the role is superadmin
  if (user && user.role === 'superadmin') {
    return true;
  }
  return false;
}