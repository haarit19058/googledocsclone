import React, { useCallback, useEffect, useRef,useState } from 'react'
import Quill from "quill"
import "quill/dist/quill.snow.css"
import "./style.css"
import { io}  from "socket.io-client"
import { useParams } from 'react-router-dom'


const TOOLBAR_OPTIONS = [
    [{header:[1,2,3,4,5,6,false]}],
    [{font:[]}],
    [{list:"ordered"},{list:"bullet"}],
    ["bold","italic","underline"],
    [{color:[]},{background:[]}],
    [{script:"sub"},{script:"super"}],
    [{align:[]}],
    ["image","blockquote","code-block"],
    ["clean"], 
]

const SAVE_INTERVAL_MS = 2000


export default function TextEditor() {
    // const wrapperRef = useRef()
    
    const {id: documentId} = useParams()
    // console.log(documentId)
    const [socket,setSocket] = useState()
    const [quill,setQuill] = useState()
    
    
    

    useEffect(()=>{
        let s= io("http://localhost:3001")
        setSocket(s)
        
        return ()=>{
            s.disconnect()
        }
    },[])
    
    
    
    useEffect(()=>{
        if (socket == null || quill == null) return


        const handleLoadDocument = (document) => {
            console.log('inside load-document');
            quill.setContents(document);
            quill.enable();
        };
        socket.on("load-document",handleLoadDocument)
        socket.emit("get-document",documentId)
        
        return () => {
            socket.off('load-document', handleLoadDocument);
        };
    },[socket,quill,documentId])
    
    
    useEffect(()=>{
        if (socket == null || quill == null) return
        
        const interval = setInterval(() => {
            socket.emit("save-document",quill.getContents())
        }, SAVE_INTERVAL_MS);
        
        
        return ()=>{
            clearInterval(interval)
        }
    },[socket,quill])
    


    useEffect(()=>{
        if (socket == null || quill == null) return
        const handler = (delta)=>{
            quill.updateContents(delta.content)
            quill.setSelection(delta.select)
        }

        // const handler1 = (delta)=>{
        //     console.log("receiving-selection",delta)
        //     quill.setSelection(delta)
        // }
        
        socket.on('receive-changes',handler)
        // socket.on('receive-changes-selection',handler1)
        
        return ()=>{
            // quill.off('text-change',handler)
            socket.off('receive-changes',handler)
            // socket.off('receive-changes-selection',handler1)
        }
    },[socket,quill])




    useEffect(()=>{
        if (socket == null || quill == null) return

        const handler = (delta,olddelta,source)=>{
            if (source!=="user") return
            let data = {content:delta,select:quill.getSelection()}
            socket.emit("send-changes",data)
        }
        
        // const handler1 = (delta,olddelta,source)=>{
        //     if (source!=="user") return
        //     let data = quill.getSelection()
        //     console.log(delta,"sending selection")
        //     socket.emit("send-changes-selection",delta)
        // }

        quill.on("text-change",handler)
        quill.on("selection-change",handler)
        return ()=>{
            socket.off('receive-changes',handler)
        }
    },[socket,quill])



    let wrapperRef = useCallback((wrapper)=>{
        if (wrapper == null) return
        wrapper.innerHTML=""
        const editor = document.createElement('div')
        wrapper.append(editor)
        const q = new Quill(editor,{theme:'snow',modules:{toolbar:TOOLBAR_OPTIONS}})
        
        q.disable()
        q.setText("Loading...")
        setQuill(q)
        // return ()=>{
        //     wrapperRef.innerHTML = ""
        // }
    },[])


  return (
    <div id = "container" className="container" ref={wrapperRef}>
    </div>
    
  )
}
