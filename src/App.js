import React, { useEffect,useState } from 'react';
import NwitterRouter from './components/NwitterRouter';
import authSerVice from './Fbase';
import { getProfileDoc } from './components/GetData';
import './asset/App.css';
function App() {
  // 초기 화면
  const [isLoggedIn ,setIsLoggedIn] = useState(false); 
  const [userobj ,setuserobj] = useState({}) ; 
  const [IsMyProfile , setIsMyProfile] =useState();
  const [newProfile, setNewProfile]=useState({});
  const basicPhoto ='https://firebasestorage.googleapis.com/v0/b/nwitter-c8556.appspot.com/o/icons8-user-64.png?alt=media&token=0e76967a-3740-4666-a169-35523d1e07cb' ;
  const basicHeader ='https://firebasestorage.googleapis.com/v0/b/nwitter-c8556.appspot.com/o/basicHeader.png?alt=media&token=3fb9d8ee-95ba-4747-a64f-65c838247ca9';
  const currentUser = authSerVice.currentUser ;

  // 마운트 마다 로그인 상태를 알아보는  observer 사용해서 유저 여부에 따른 로그인 여부 상태 변화, 초기 화면 로그아웃으로 세팅 
  const findMyProfile =(userobj ,setIsMyProfile)=> getProfileDoc(userobj.uid)
  .get()
  .then(doc => {
    if(doc.exists){
      setIsMyProfile(true);
    }else {
      setIsMyProfile(false);
      const newMyProfile = {
        uid:userobj.uid,
        userId:userobj.id,
        userName: userobj.displayName,
        introduce:"",
        headerUrl:basicHeader,
        photoUrl:basicPhoto, 
        following:[],
        follower:[],
        notifications : []
      };
      setNewProfile(newMyProfile);
      getProfileDoc(userobj.uid).set(newMyProfile)
    };
  })
  .catch((e) => {
  console.log("Error getting document", e)
  });

  const LogIn =()=>authSerVice.onAuthStateChanged(async(user)=> 
    {if(user){
      
      const ind = user.email.indexOf("@");
      const end = user.email.substring(0,ind);
      const newUserObj ={
        displayName : end,
        uid: user.uid,//-creatorId ,userId
        id: end, 
        photoURL:user.photoURL,
        updateProfile: (args) => user.updateProfile(args) , //프로필 업데이트 함수 
      };
      if(user.displayName == null){ //user displayname이 없다면 초기에 생성해주어서 나중에 오류발생 x 
        user.updateProfile({displayName:end});
      };
      if(user.photoURL == null){
        user.updateProfile({
          photoURL:basicPhoto
        })
      }
      findMyProfile(newUserObj, setIsMyProfile);
      // react는 랜더링에 특화되어 있지만 object 의 내용이 많으면 랜더링 시 랜더링이 안되는 문제가 발생할 수 있음
      /* 해결1 : 필요한 정보만 담아서 userobj을 만듦 단, refrecshUser에서 동일 코드가 반복 이는 Object.assign({}, user) 로 해결 */
      setuserobj(newUserObj) ; 
      setIsLoggedIn(true); 
    }else{
      setIsLoggedIn(false);
    };
  });
  
  useEffect( ()=>{
    LogIn();
      // userobj 바뀌면 전체가 다시 렌더링
    const refreshUser = (currentUser)=>{
    setuserobj(
      Object.assign({}, currentUser) // 객체를 복사해 대상 객체에 붙이는 assign을 이용해  사용자가
    );
  };
    refreshUser(currentUser);
  },[currentUser]
  )
  return (
    <>
      <NwitterRouter isLoggedIn = {isLoggedIn} userobj={userobj}  IsMyProfile={IsMyProfile}  setIsMyProfile ={setIsMyProfile} basicPhoto={basicPhoto} newProfile={newProfile} /> 
    </>
    
  );
}

export default App;