import React from 'react';
import Nweet from './Nweet';

export const ProfileTopForm = ({profile , follower} )=>{

  return(
    <section id="profileForm">
      <div id="profileForm_profile">
        <img src={profile.photoUrl} width="150px" height="100px"  alt="profile"/>
        <span>{profile.userName}</span>
      </div>
      <div className="follow">
        <ul>
          <li>
          {profile.following && (
        <div>following : {profile.following[0] === undefined ? 0 :profile.following.length }</div>
      )}
          </li>
          <li>
          follower : {follower[0] === undefined ? 
      ( profile.follwer === [] ? 
        0 : profile.follower.length )
      :follower.length }
          </li>
        </ul>
      </div>
    </section>
  )
}

export const ProfileBottomForm = ({nweets ,userObj})=>{
  
  return (
    <sectoion >
      {Array.isArray(nweets) && nweets.map(nweet => <Nweet  nweetObj ={nweet}  isOwner={nweet.creatorId === userObj.uid} userObj={userObj}/>  )}
    </sectoion>
  )
}
