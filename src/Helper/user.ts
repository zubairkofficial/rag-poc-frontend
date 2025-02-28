
// import { data } from "react-router-dom"

interface Response{
    user:User,
    token:string    
}

export interface User {
    name:string,
    type:string,
    email:string,
  
}

export const setUserToken = (data:Response)=>{
    localStorage.setItem("name",data.user.name)
    localStorage.setItem("email",data.user.email)
    localStorage.setItem("type",data.user.type)
    localStorage.setItem("token",data.token)
    setUserInfo(data.user)
}



const user_email = localStorage.getItem('email')
const user_name = localStorage.getItem('name')


export const user = {
   name: user_name,
    email: user_email,
}


export const setUserInfo = (data:User) => {
    localStorage.setItem("name",data.name)
    localStorage.setItem("email",data.email)
    user.name = data.name
    user.email = data.email
}

