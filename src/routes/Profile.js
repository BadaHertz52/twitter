import React, { useEffect, useState } from 'react' ;
import { useHistory, } from 'react-router-dom';
import { ProfileBottomForm, ProfileTopForm } from '../components/ProfileForm';
import { getNweets, getProfileDoc} from '../components/GetData';

const Profile = ({userObj}) => {
  const [userNweets , setUserNweets] =useState([]);
  const [calling, setCalling] =useState(true);
  const [onFollow ,setOnFollow] = useState({});
  const [followList, setFollowList] = useState([]);
  const historyUserProfile = useHistory().location.state.userProfile;
  const [follower , setFollower]=useState(historyUserProfile.follower);
  const currentUserProfile =getProfileDoc(userObj.uid);
  const userProfile =getProfileDoc(historyUserProfile.creatorId) ;
  const newAlarm ={userId:userObj.uid , creatorId : "none", createdAt: "none", value: "follow" };

  const changeFollowBtn = ()=>{
    followList.includes(historyUserProfile.creatorId) ? setOnFollow({
      follow: true , text : "팔로우 중"
    }) :
    setOnFollow({
      follow: false , text : "팔로우 하기"
    });
  };
  // 나의 팔로잉 명단
  const getFollowList = async()=>{
      await currentUserProfile.get().then(
        doc => setFollowList(doc.data().following) 
      );
      changeFollowBtn();
  };

  // 해당 프로필 유저의 팔로워 명단 
  const getUserFollower = async()=>{ 
    await userProfile.get().then(
    doc => setFollower(doc.data().follower) 
  );
};
  // 해당 프로필 유저의 nweets 
  const getUserNweets = ()=> {
    getNweets (historyUserProfile.creatorId ,setUserNweets) ; 
    setCalling(false);
  }

  useEffect( ()=> {
    getUserNweets();
    getFollowList();
    getUserFollower();
  },[]);

  const follow = (e)=> {
    e.preventDefault();
    if(onFollow.follow === false){
      //나의 팔로잉 리스트에 해당 프로필 유저를 추가 
      followList.unshift(historyUserProfile.creatorId); 
      setFollowList(followList);
      //해당 프로필 유저의 팔로워 리스트에 나를 추가 
      follower.unshift(userObj.uid);
      setFollower(follower);
      //알람 보내기 
      historyUserProfile.alarm.unshift(newAlarm);
      userProfile.update({alarm : newAlarm})
      
    }else if(onFollow.follow === true){
      setFollowList(list =>list.filter(user => user !== historyUserProfile.creatorId) );
      setFollower(list =>list.filter(user => user !== userObj.uid)  );
    }; 
    //변경된 팔로워,팔로잉 리스트 업로드 
    currentUserProfile.update({
      following : followList
    });
    userProfile.update({
      follower: follower
    });
    changeFollowBtn();
  }

  return (
    <>
      <section>
        <ProfileTopForm  profile={historyUserProfile} follower={follower} />
        <button  onClick={follow}>{onFollow.text}</button>
        <div id="div"></div>
      </section>
      <sectoion >
        {calling && <div className ="nweets_calling">
          데이터를 불러오는 중입니다.
        </div>  }
        <ProfileBottomForm  
        nweets={userNweets} 
        userObj={userObj}
        /> 
      </sectoion> 
    </> 
  ) 
}

export default Profile