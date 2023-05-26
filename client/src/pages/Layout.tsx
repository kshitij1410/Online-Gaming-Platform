import React, { useState } from 'react';
import Register from './Register';
import Login from './Login';


const Layout = ({ isUserAuthenticated }: { isUserAuthenticated: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const [isLogin, setIsLogin] = useState<boolean>(false);

    return (
        <div className='main bg-gray-300 w-screen h-screen ' >
            <div className='container flex flex-row p-20 h-full w-full flex-wrap relative'>
                <div className='left bg-background-image h-full w-2/3 bg-cover opacity-95'>
                    <div className='text-white w-1/2 pl-36 top-1/2 absolute font-bold text-xl font-mono leading-10'>
                        Play Online Ping Pong Game with your frineds and win exciting prizes and gift. So what are you waiting for just let's play...

                    </div>
                </div>
                <div className='right h-full w-1/3 flex flex-col items-center justify-center bg-white'>
                    {
                        isLogin === false ? <Register setIsLogin={setIsLogin} /> : <Login isUserAuthenticated={isUserAuthenticated} setIsLogin={setIsLogin} />
                    }

                </div>
            </div>
        </div>
    )
}

export default Layout;