import React, { useEffect } from 'react'
import { backendRequest } from '../Helper/BackendReques';
import { useNavigate } from 'react-router-dom';
import { notifyResponse } from '../Helper/notify';



interface NewChatInterface {
    id: number;
    success: boolean;
  }

const Home = () => {
    const navigate = useNavigate()
    const handleNewChat = async () => {
        try {
          const response = await backendRequest<NewChatInterface>(
            "POST",
            "/create-chat"
          );
          if (response.success) {
            navigate(`chat/${response.id}`);
          }
          notifyResponse(response)
        } catch (error) {
          // Handle error
        //   notifyResponse(error)
        }
      };
    useEffect(()=>{
        handleNewChat()
    },[])

  return (
    <div>
      
    </div>
  )
}

export default Home
