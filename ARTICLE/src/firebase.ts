import { getFirestore, addDoc,collection,serverTimestamp, getDocs } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";

export const createFirebase=(title:string,memo:string,fileData:any)=>{
  const metadata={
    contentType: 'image/jpeg',
  }
  const storage = getStorage();
  const imageRef = ref(storage, '/' + title);
  uploadBytesResumable(imageRef, fileData, metadata)
    .then((snapshot) => {
      getDownloadURL(snapshot.ref)
        .then((url) => {
          addDoc(collection(getFirestore(), "articles"), {
            title: title,
            memo: memo,
            filePath : url,
            createDate: serverTimestamp()
          })
            .then(()=>{
              console.log('success')
            })
            .catch((e)=>{
              console.log('fail',e)
            })
        });
    })
    .catch((error) => {
      console.error('Upload failed', error);
    });
}

export const fetchFirebase=async()=>{
  const data:Array<any>=[]
  const querySnapshot = await getDocs(collection(getFirestore(), "articles"))
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    data.push(doc.data())
  })
  return data
}