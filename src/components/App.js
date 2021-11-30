import React, { useEffect, useState } from 'react';
import NwitterRouter from './NwitterRouter';
import authSerVice from '../Fbase';
import { findMyProfile} from './GetData';

function App() {
  // 초기 화면
  const [isLoggedIn ,setIsLoggedIn] = useState(false); 
  const [userobj ,setuserobj] = useState({}) ; 
  const [IsMyProfile , setIsMyProfile] =useState();
  const basicPhoto ='https://firebasestorage.googleapis.com/v0/b/nwitter-aaae4.appspot.com/o/icons8-user-64%20(1).png?alt=media&token=edde3c05-85d4-4473-a730-c039e975ce92' ;
  const currentUser = authSerVice.currentUser ;
  // 마운트 마다 로그인 상태를 알아보는  observer 사용해서 유저 여부에 따른 로그인 여부 상태 변화, 초기 화면 로그아웃으로 세팅 
  useEffect(()=>{
    const logIn =()=>
    authSerVice.onAuthStateChanged(async(user)=> 
    {if(user){
      const ind = user.email.indexOf("@");
      const end = user.email.substring(0,ind);
      const newUserObj ={
        displayName : user.displayName,
        uid: user.uid,//-creatorId ,userId
        id: end, 
        photoURL:user.photoURL,
        updateProfile: (args) => user.updateProfile(args) , //프로필 업데이트 함수 
      };
      if(user.displayName == null){ //user displayname이 없다면 초기에 생성해주어서 나중에 오류발생 x 
        user.updateProfile({displayName:end});
        findMyProfile(newUserObj, setIsMyProfile);
        console.log("?") 
      };
      if(user.photoURL == null){
        user.updateProfile({
          photoURL:basicPhoto
        })
      }
      // react는 랜더링에 특화되어 있지만 object 의 내용이 많으면 랜더링 시 랜더링이 안되는 문제가 발생할 수 있음
      /* 해결1 : 필요한 정보만 담아서 userobj을 만듦 단, refrecshUser에서 동일 코드가 반복 이는 Object.assign({}, user) 로 해결 */
      await setuserobj(newUserObj) ; 
      setIsLoggedIn(true); 
    }else{
      setIsLoggedIn(false);
    };
  }); 
  logIn();
  } ,[]); 

  useEffect( ()=>{
      // userobj 바뀌면 전체가 다시 렌더링
    const refreshUser = (currentUser)=>{
    setuserobj(
      Object.assign({}, currentUser) // 객체를 복사해 대상 객체에 붙이는 assign을 이용해  사용자가
    );
  };
    refreshUser(currentUser)
  },[currentUser]
  )
  return (
    <>
      <NwitterRouter isLoggedIn = {isLoggedIn} userobj={userobj}  IsMyProfile={IsMyProfile} basicPhoto={basicPhoto} /> 
      <div id="fotter">
        @copy {new Date().getFullYear()} Nwitter
      </div>
    </>
    
  );
}

export default App;
