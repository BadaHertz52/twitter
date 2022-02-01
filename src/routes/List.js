import React, {  useRef, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router";
import { useContext, useEffect } from "react/cjs/react.development";
import { getProfileDoc } from "../components/GetData";
import { ProfileContext } from "../context/ProfileContex";
import { UserContext } from "../context/UserContext";
import { dbService } from "../Fbase";

const List =({userobj})=>{
  const [showFollower, setShowFollower] =useState(true);
  const {myProfile, profileDispatch}=useContext(ProfileContext);
  const {userProfile, userDispatch}=useContext(UserContext);
  const [profile, setProfile]=useState({userName:"", userId:"", follower:[], following:[]});
  const [followers,setFollowers]=useState([{photoUrl:"", userName:"", userId:"", uid:"" , introduce:""}]);
  const [followings, setFollowings]=useState([{photoUrl:"", userName:"", userId:"", uid:"" , introduce:""}]);
  const navigate =useNavigate();
  const location =useLocation();
  const pathname =location.pathname;
  const state =location.state;
  const start = pathname.indexOf('/list');
  const back =pathname.slice(0,start);
  const listBtns =document.querySelectorAll('.listBtn');
  const listFollower =document.getElementById('listFollower');
  const listFollowing =document.getElementById('listFollowing');
  
  const goProfile =async(user)=>{
    const getDocs = await dbService
      .collection(`nweets_${user.uid}`)
      .get()
      .then();
      const nweets = getDocs.docs.map(doc => ({
        id: doc.id ,
        ...doc.data()}))  ;
    userDispatch({
      type:"GET_USER_DATA",
      userProfile :user,
      userNweets:nweets
    });
      navigate(`/${user.userId}` ,{state:{
        pre_previous:state.previous,
        previous:location.pathname,
        userId:user.userId 
        ,value:"userProfile"}});
  };

  const changeStyle =(what)=>{
    listBtns.forEach(btn=>btn.classList.remove('check'));
    what !== null && what.parentNode.classList.add('check');
  }
  const pushFollower=async()=>{
    const users = await Promise.all( profile.follower.map(user => getProfileDoc(user).get().then(doc=> doc.data())));
    setFollowers(users);
    setShowFollower(true);
    changeStyle(listFollower);
  };
  const pushFollowing=async()=>{
    const users=await Promise.all( profile.following.map(user => getProfileDoc(user).get().then(doc=>doc.data())));
    setFollowings(users);
    setShowFollower(false);
    changeStyle(listFollowing);
  };
  const goBack=()=>{
    navigate(`${back}`, {state:state})
  };
  const goListFollower=()=>{navigate(`${back}/list/follower` , 
  {state:state})};

  const goListFollowing =()=>{
    navigate(`${back}/list/following` , 
    {state:state})
  };
  const getProfile =()=>{
    const isMine =state.previousState.isMine;
    switch (isMine) {
      case true:
        setProfile(myProfile);
        break;
      case false:
        setProfile(userProfile);
        break;
      default:
        break;
    }
  };
  useEffect(()=>{
    if(state !== null){
      getProfile();
  
  }},[state, userProfile]);
  useEffect(()=>{
    location.pathname.includes("following") && pushFollowing();
    location.pathname.includes("follower") && pushFollower();
  },[profile])

  const UserList =({user , followingMe})=>{
    const isFollowing = myProfile.following.includes(user.uid); 
    
    const onOver =(event)=>{
      const target =event.target;
      target.classList.add("unFollow"
          );
     target.innerText ="Unfollow";
      };
    const onOut =(event)=>{
      const target =event.target;
      target.classList.remove("unFollow"
          );
     target.innerText ="Following";
      }
    const unFollow =()=>{
      profileDispatch({
        type:"UNFOLLOWING",
        id:user.uid,
        userNotifications: user.notifications.filter(n=> 
          n.value !=="following" || 
          n.user !== userobj.uid || 
          n.docId !== null),
        userFollower: user.follower.filter(f=> f !== userobj.uid),
        following: myProfile.following.filter( f=> f!== userProfile.uid)
      });
    };

    const onFollow =()=>{
      profileDispatch({
        type:"FOLLOWING",
        id:user.uid,
        userNotifications:user.notifications,
        userFollower:user.follower.concat(userobj.uid),
        following: myProfile.following.concat(userProfile.uid)
      });
    };


    return(
    <>
      <div className="list_profile">
          <img 
          src={user.photoUrl}
          alt="profile"
          >
          </img>
          <div className="list_profile_userInform">
            <div className="list_profile_user"> 
              <div className="list_userName">
                  <div>{user.userName}</div>
                  <div>
                    <span>
                      @{user.userId}
                    </span>
                    {followingMe && 
                      <span className="followingMe">
                        나를 팔로우합니다.
                      </span>
                    }
                  </div>
              </div>
              { isFollowing  ?
                <button 
                className="list_followBtn  following"
                onClick={unFollow}
                onMouseOver={onOver}
                onMouseOut={onOut}
                >
                  Following
                </button>
              :
                <button 
                className="list_followBtn  unfollowing"
                onClick={onFollow}>
                Follow
                </button>
                }

            </div>
            <div className="list_userIntroduce">{user.introduce}</div>
          </div>
      </div>
    </>
    )
  };

  return (
    <>
      {state !== undefined && (
          <div id="list">
            <div id="list_header">
              <button className='back' onClick={goBack}>
                <FiArrowLeft/>
              </button>
              <div id="list_userInform"> 
                <div>{profile.userName}</div>
                <div>@{profile.userId}</div>
              </div>
            </div>
          <div id="list_btn">
            <button  className="listBtn" 
            onClick={goListFollower} >
              <div id="listFollower"  >
                Follower
              </div>
            </button>
            <button className="listBtn"  
            onClick={goListFollowing}>
              <div  id="listFollowing">
                Following
              </div>
            </button>
          </div>
          <div id="list_list">
          {showFollower ? 
            followers.map(f =>
            <button 
              className="list_UserList"
              onClick={()=>goProfile(f)}
            >
              <UserList user={f} followingMe={myProfile.follower.includes(f.uid)}/>
            </button>
            )
          : 
            followings.map(f=>
            <button 
              className="list_UserList"
              onClick={()=>goProfile(f)}
            >
              <UserList user ={f} followingMe={myProfile.follower.includes(f.uid)}/>
            </button>
          )
          }
                  
          </div>
        </div>
      )}
    </>
  )
}

export default List ;