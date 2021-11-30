import { dbService } from "../Fbase";

//nweet
export const getNweets = async(id , setFun)=>{
  const getDocs = await dbService
    .collection(`nweets_${id}`)
    .get();
  const nweets = getDocs.docs.map(doc => ({
    id: doc.id ,
    ...doc.data()}))  ;
  setFun(nweets)
};

//프로필 

export const getProfileDoc = (id)=>dbService.collection("users").doc(`${id}`)  ;

export const getProfile = async(id ,setProfile)=>{
  await getProfileDoc(id).get().then((doc)=>{
    if(doc.exists){
      setProfile(doc.data());
    }else {
      console.log("Can't find the document")
    }
  }).catch(error => {
    console.log("Error getting document:" ,error)
  })
};

export const findMyProfile =(userobj ,setIsMyProfile)=> getProfileDoc(userobj.uid).get()
.then(doc => {
  if(doc.exists){
    setIsMyProfile(true);
  }else {
    setIsMyProfile(false);
    console.log("Can't find profile document, so start making profile");
    const newMyProfile = {
      creatorId:userobj.uid,
      userId:userobj.id,
      userName: userobj.displayName,
      photoUrl:"", 
      following:[],
      follower:[],
      alarm : []
    };
    getProfileDoc(userobj.uid).set(newMyProfile)
  }
}).catch((e) => {
  console.log("Error getting document", e)
});