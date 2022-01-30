import React, { useContext, useState } from 'react';
import { AiOutlineRetweet, AiOutlineUser} from "react-icons/ai";
import { AiOutlineHeart } from "react-icons/ai";
import Nweet from '../components/Nweet';
import {ProfileContext} from '../context/ProfileContex';
import { NweetContext } from '../context/NweetContex';
import {  getNweet, getNweetDoc, getNweetsDocs, getProfileDoc} from '../components/GetData';
import { useEffect } from 'react/cjs/react.development';
import {  useLocation, useNavigate } from 'react-router';
import { dbService } from '../Fbase';
import { UserContext } from '../context/UserContext';

const Notification = ({userobj}) => {
  const {myProfile} =useContext(ProfileContext);
  const {myNweets} =useContext(NweetContext);
  const {userDispatch}=useContext(UserContext);
  const [notifications, setNotifications]=useState
  ([]);
  const buttons =document.querySelectorAll('.notificationBtn');
  const [showAll, setShowAll]=useState(true);
  const wholeBtn =document.getElementById('wholeBtn');
  const mentionBtn  =document.getElementById('mentionBtn');
  const navigate =useNavigate();
  const location =useLocation();
  const changeStyle =(what)=>{
    buttons.forEach(button =>button.classList.remove('check'));
    what.classList.add('check');
  };

  const go =(n)=>{
    const goProfile =async(n)=>{
      const nweetDocs =await getNweetsDocs(n.user.uid);
      const nweets =nweetDocs.docs.map(doc =>({ id:doc.id ,...doc.data()}));    
      userDispatch({
        type:"GET_USER_DATA",
        userProfile :n.user,
        userNweets:nweets
      });
      navigate(`${n.user.userId}` ,{
        state:{previous:location.pathname, 
          userId:n.user.userId ,value:"userProfile"}})
    }
    n.value === "following"?
    goProfile(n)
    :
    navigate("timeLine" , {state:{
      previous:location.pathname,
      docId:n.nweet.docId , 
      value:n.value, 
      userId:n.user.userId, 
      userName:n.user.userName,
      userUid:n.user.uid ,
      aboutDocId:n.aboutNweet==""? null: n.aboutNweet}})
  };

  useEffect(()=>{
    const getData=async()=>{
      const array = await Promise.all( myProfile.notifications.map( (n) =>{
        const result = getProfileDoc(n.user).get().then(async(doc) =>{
          const nweet =n.docId == null ? null :  myNweets.filter(nt=> nt.docId == n.docId)[0];
          const notificaton ={value:n.value ,nweet:nweet, user:doc.data(), aboutNweet:n.aboutDocId};
          return notificaton
        });
        return result 
      })).then(result => result);
      const array_withNweets= await Promise.all(array.map(a=>{
        if(a.aboutNweet!==""){
          const result= dbService.collection(`nweets_${a.user.uid}`)
          .doc(`${a.aboutNweet}`)
          .get()
          .then(
          doc=> ({...a, aboutNweet:doc.data()}));
          return result
        }else{return a}
          })).then(result=>result);
      setNotifications(array_withNweets);
    }
    myProfile.notifications[0]!==undefined && getData();
  },[myProfile])
  return (
    <section id="notification" className='header'>
      <div>Notification</div>
      <div id="notificationBtns">
        <button className='notificationBtn'id="wholeBtn" onClick={()=>{setShowAll(true); changeStyle(wholeBtn)}}>
          <div id="all">All</div>
        </button>
        <button className='notificationBtn' id="mentionBtn" onClick={()=>{setShowAll(false); changeStyle(mentionBtn)}}>
          <div id="mention">
            Mentions
          </div>
        </button>
      </div>
      <div> 
      {showAll ?
      notifications.map
        ( (n) => 
        ( 
        n.value !== 'answer' ? (
      <div 
      id="notification_notification"
      onClick={()=>go(n)}>
          <div className='notification_left'>
            { (n.value === 'qn'|| n.value ==='rn') &&
              <AiOutlineRetweet className='rnIcon'/>
            }
            {n.value === 'heart'&&
                <AiOutlineHeart className='heartIcon'/>
              }
            {n.value === 'following'&&
                <AiOutlineUser className='followIcon'/>
              }
          </div>
          
            <div className='notification_right'>
            <img className="profile_photo" src={n.user.photoUrl} alt="usrProfilePhoto"/>
            <div className='notification_inform'>
              <div>
                <span style={{fontWeight :'bold'}}>{n.user.userName}</span>님이 &nbsp; 
                {(n.value === 'qn'|| n.value=== 'rn') && '내 트윗을 리뉴윗했습니다.'}
                {(n.value === 'heart') && '내 트윗을 마음에 들어합니다.'}
                {(n.value === 'following') && '나를 팔로우합니다.'}
              </div>
            <div>
            </div>
          </div>
        </div>
      </div>)
      :( 
        <div  class="mention" onClick={()=>go(n)}>
          <Nweet isOwner={false} userobj={userobj} nweetObj={n.aboutNweet} answer={true}/>
        </div>
      )))
    :
    ( notifications.filter(n=>n.value === 'answer').map(n=>
      <div class="mention"onClick={()=>go(n)}>
        <Nweet isOwner={false} userobj={userobj} nweetObj={n.aboutNweet} answer={true}/>
      </div>
    ))}
    </div>
    </section> 
)}
export default Notification ;