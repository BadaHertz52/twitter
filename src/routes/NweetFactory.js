import React, { useState, useContext } from 'react';

import { Link , useLocation, useNavigate} from 'react-router-dom';
import {HiOutlinePhotograph} from "react-icons/hi";
import { storageService } from '../Fbase';
import {NweetContext} from '../context/NweetContex';
import { useEffect } from 'react/cjs/react.development';
import Nweet from '../components/Nweet';
import { BiArrowBack, BiX } from 'react-icons/bi';
import {  sendNotification, updateMyNweetsByMe, updateNweetNotifications } from '../components/GetData';

const NweetFactory = ({userobj ,setPopup }) => {

  const [nweetFactory, setNweetFactory]=useState("nweetFactory");
  const location= useLocation();
  const navigate =useNavigate();
  const {nweetInput, nweetDispatch ,myNweets} =useContext(NweetContext);
  const {text} =nweetInput ;
  const [attachment ,setAttachment] = useState("");
  const now = new Date();
  const year = now.getFullYear();
  const month =now.getMonth()+1;
  const date = now.getDate();
  const hour = now.getHours();
  const minutes = now.getMinutes();

  const onClose=()=>{
    nweetDispatch(
      {type:'CLEAR_INPUT'}
    );
    const pathname=location.pathname;
    const start =pathname.indexOf('nweet');
    const back =pathname.slice(0,start);
    location.pathname ==="/nweet"?
    navigate("/" ,{state:{previous:location.pathname}})
    :
    location.pathname.includes("nweet")&&
    navigate(back ,
      {state:{
        previous:location.pathname.includes("list")? location.state.pre_previous: location.pathname , 
        pre_previous:location.state.pre_previous,
        previousState: (location.pathname.includes("status")|| location.pathname.includes("list"))? location.state.previousState : null,
        value :location.pathname.includes("status")? "status": null
      }});
  };
  const onSubmit = async(event) => {
    event.preventDefault();
    const docId= JSON.stringify(Date.now());
    let url ="" ;

    if(attachment !== ""){
    const attachmentRef =storageService.ref().child(`${userobj.uid}/${docId}`);
    const response = await attachmentRef.putString(attachment, "data_url");
    url=await response.ref.getDownloadURL();
    }
    const newNweet ={
      value:location.state ==null || location.state.value ==undefined ?
      "nweet" : 
      location.state.value  ,
      text:text.replace(/(\r\n|\n)/g, '<br/>'),
      attachmentUrl:url,
      creatorId: userobj.uid,
      docId:docId,
      createdAt:[
        year,month, date ,hour,minutes
      ],
      about: location.state ==null || location.state.value == undefined? 
      null : 
      {creatorId:location.state.nweetObj.creatorId ,
      docId:location.state.nweetObj.docId
      },
      notifications:[],
    };
    nweetDispatch({
      type:"CREATE",
      docId:docId,
      uid:userobj.uid,
      nweet :newNweet
    });

    setAttachment("");
    
    setPopup !== undefined && setPopup(false)
    // 알림
    // 나의 팔로우들에게 알림 -오류 해결 
    // if(myProfile.following[0]!==undefined){
    //   myProfile.following.forEach(user=>
    //     { dbService
    //       .collection('users')
    //       .doc(`${user}`)
    //       .get()
    //       .then(doc=> {
    //         if(doc.exists){ 
    //           const profile={...doc.data()};
    //           const newNotifications= profile.notifications.concat({
    //             user:userobj.uid.concat,
    //             docId: docId,
    //             value:"nweet"
    //           });
    //           dbService
    //           .collection('users')
    //           .doc(`${user}`)
    //           .set({notifications:newNotifications},{merge:true});
    //         }
    //         else
    //         {console.log("Can't find user's profile")}})
    //       .catch(error=> console.log(error,"in NweetFactory"));

    //     })
    // };
    if(location.state !==null && location.state.value !== undefined){
         //알림 가기, 알림 업데이트 
      const profile =location.state.profile ;
      const nweetObj =location.state.nweetObj;
      const value =location.state.value;
      // 작성자의 nweet에 대한 알림
    if( nweetObj.creatorId !== userobj.uid ){
      updateNweetNotifications(nweetObj,profile ,value,userobj ,docId) 
      //작성자 profile에 대한 알림 
      sendNotification(value, userobj, nweetObj, profile, docId);
    }else{
      updateMyNweetsByMe(myNweets,value,userobj,docId,nweetDispatch,nweetObj.docId)
    }
    }
      onClose()
    };

  const onChange =  (event) => {
    const {name, value}= event.target;
    nweetDispatch({
      type:"WRITE",
      name,
      value
    })
  }

  const onFileChange =(event) => {
  const {
    target:{files}
  } = event ;
  const theFile =files[0];
  const reader = new FileReader();
  reader.onloadend = (finishedEvent) =>{
    const { currentTarget : {result}} = finishedEvent;
    setAttachment (result);
    nweetDispatch({
      type:"WRITE",
      name:"attachmentUrl",
      value :result
    })
  };
  reader.readAsDataURL(theFile);
};

  const onClearAttachment = ()=> {
    setAttachment("");
  };

  const OnEditAttachment =(event)=>{
    event.preventDefault();
    navigate('crop', {state:{
      pre_previous:location.state!==null? location.state.previous : "",
      previous:location.pathname,
      what:"attachment",
      src:attachment,
      value:location.state!==null? location.state.value:null}})
  };
  useEffect(()=>{

    if(location.state !==null){
      if(location.state.what !== undefined){
        location.state.what =="attachment"&&
        setAttachment(nweetInput.attachmentUrl)
      };
      if(location.state.value !== undefined){
        const value =location.state.value;
        (value==="answer" || value ==="qn" || value==="nweet") &&
        setNweetFactory("nweetFactory popup");
      }
    }
  },[location]) ;

  return (
    <div className={nweetFactory}>
      <div class='nweetFactory_inner'>
        {nweetFactory =="nweetFactory popup" &&
          <div class="nweetFactory_header">
            <button  onClick={onClose}>
              {location.state !==null && (location.state.value=="nweet" ?
              <BiX/> :
              <BiArrowBack/>
              )
              }
            </button> 
            <button onClick={onSubmit} id="nweetBtn" >
            Nweet
            </button>
          </div>
        }

        { location.state !== null && (location.state.value === "answer" &&
        <div id="answerNweet">
          <Nweet
            nweetObj={location.state.nweetObj} 
            userobj={userobj} 
            isOwner ={location.state.isOwner} 
            answer={true} 
          />
        </div>
        )}
        <div className="nweetFactory_box">
          <div className="userProfile">
                <Link  to={{
                  pathname:`/${userobj.id}`,
                }}>
                  <img 
                    className="profile_photo" 
                    src={userobj.photoURL}
                    alt="profile"
                  />
                </Link>
          </div>
          <form onSubmit={onSubmit}>
            <textarea
              value={text}
              name='text'
              onChange={onChange}
              type="text"
              placeholder="무슨 일이 일어나고 있나요?"
              maxLength={120}
            />
              {attachment !== ""&& (
                <div id="nweetfactory_attachment">
                  <img src={attachment}  alt="nweet attachment"/>
                  <button onClick={onClearAttachment}>x</button>
                  <button onClick={OnEditAttachment}>Edit</button>
                </div>
              )}
              {location.state !==null && location.state.value=="qn"&&
                <div id="nweetFactory_qn">
                  <Nweet 
                    nweetObj={location.state.nweetObj}  
                    userobj={userobj} 
                    isOwner ={location.state.isOwner} 
                    answer={false}
                  />
                </div>
              }
            <div>
              <label for="nweet_fileBtn">
                <HiOutlinePhotograph />
              </label>
              <input 
                type="file" 
                accept="image/*" 
                id="nweet_fileBtn" 
                style={{display:"none"}} 
                onChange={onFileChange} 
              />
              <input 
                type="submit" 
                value="Nweet"  
                className='btn'
              />
            </div>
          </form>
        </div>
      </div>
  </div>
  )
}

export default React.memo( NweetFactory );