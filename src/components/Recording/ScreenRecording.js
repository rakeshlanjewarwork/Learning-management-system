import React from 'react'
import RecordRTC from 'recordrtc'
import './Recording.css'
import uploadFile from '../../utils/generic/genericMethod'

var recorder
class ScreenRecording extends React.Component {
   state = {
      stopRecording: false,
      startRecording: false
   }
   componentDidMount() {
      if (
         !navigator.getDisplayMedia &&
         !navigator.mediaDevices.getDisplayMedia
      ) {
         var error = 'Your browser does NOT support the getDisplayMedia API.'
         this.setState({
            errorMessage: error
         })
      }
   }
   invokeGetDisplayMedia = (success, error) => {
      var displaymediastreamconstraints = {
         video: {
            displaySurface: 'monitor', // monitor, window, application, browser
            logicalSurface: true,
            cursor: 'always' // never, always, motion
         }
      }
      // above constraints are NOT supported YET
      // that's why overridnig them
      displaymediastreamconstraints = {
         video: true
      }
      if (navigator.mediaDevices.getDisplayMedia) {
         navigator.mediaDevices
            .getDisplayMedia(displaymediastreamconstraints)
            .then(success)
            .catch(error)
      } else {
         navigator
            .getDisplayMedia(displaymediastreamconstraints)
            .then(success)
            .catch(error)
      }
   }
   addStreamStopListener = (stream, callback) => {
      stream.addEventListener(
         'ended',
         function() {
            callback()
            callback = function() {}
         },
         false
      )
      stream.addEventListener(
         'inactive',
         function() {
            callback()
            callback = function() {}
         },
         false
      )
      stream.getTracks().forEach(function(track) {
         track.addEventListener(
            'ended',
            function() {
               callback()
               callback = function() {}
            },
            false
         )
         track.addEventListener(
            'inactive',
            function() {
               callback()
               callback = function() {}
            },
            false
         )
      })
   }
   captureScreen = callback => {
      this.invokeGetDisplayMedia(
         screen => {
            this.addStreamStopListener(screen, () => {
               // this.stopRecordingCallback();
            })
            callback(screen)
         },
         function(error) {
            console.error(error)
            alert(
               'Unable to capture your screen. Please check console logs.\n' +
                  error
            )
         }
      )
   }
   stopRecordingCallback = async () => {
      this.video.src = this.video.srcObject = null
      const blob = recorder.getBlob()
      this.video.src = URL.createObjectURL(recorder.getBlob())
      const url = await uploadFile(blob)
      console.log(url)
      this.video.muted = false
      recorder.screen.stop()
      recorder.destroy()
      recorder = null
   }
   startRecording = () => {
      !this.state.startRecording &&
         this.captureScreen(screen => {
            this.video.srcObject = screen
            recorder = RecordRTC(screen, {
               type: 'video'
            })
            recorder.startRecording()
            // release screen on stopRecording
            recorder.screen = screen
            this.setState({
               startRecording: true,
               stopRecording: false
            })
         })
   }
   stopRecording = () => {
      recorder.stopRecording(this.stopRecordingCallback)
      this.setState({
         startRecording: false,
         stopRecording: true
      })
   }
   render() {
      return (
         <div className='webcam-background'>
            <video
               className='webcam-record'
               ref={element => (this.video = element)}
               controls
               autoPlay
               playsInline></video>
            <button
               className='webcam-button'
               id='btn-start-recording'
               onClick={this.startRecording}>
               Start Recording
            </button>
            <button
               className='webcam-button'
               id='btn-stop-recording'
               onClick={this.stopRecording}>
               Stop Recording
            </button>

            {/* <hr /> */}
         </div>
      )
   }
}
export default ScreenRecording
