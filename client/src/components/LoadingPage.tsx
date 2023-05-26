import React from 'react';

const Loading = () => {

    return (
        <>
            <div className=' w-screen' style={{maxHeight:"100vh"}}>

                <div className='p-20 text-center text-2xl font-extrabold'>Wait for some more second to connect....</div>
                <div className='bg-loader h-40 bg-contain bg-no-repeat w-16 mx-auto'></div>
            </div>
        </>
    )
}

export default Loading;