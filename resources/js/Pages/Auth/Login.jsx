
import  SlidingLoginSignup  from './SlidingLoginSignup'

export default function Login({ status, canResetPassword }) {

    return (
        <>
            
            <SlidingLoginSignup
                status={status} canResetPassword={canResetPassword}
            />
        </>
        
    );
}
