import { logOutServerAction } from '@/app/lib/server-actions/auth';

export default function LogOutButton() {
  return (
    <form>
      <button 
        className="btn btn-outline-danger" 
        formAction={logOutServerAction}
      >
        Or click here to logout.
      </button>
    </form>
  )
}