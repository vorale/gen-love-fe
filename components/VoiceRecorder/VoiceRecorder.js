import { Button, Flex } from '@aws-amplify/ui-react'
import { useState, useRef } from 'react'
import { Storage } from 'aws-amplify'

export const VoiceRecorder = ({ onVoiceRecorded }) => {
    const [isRecording, setIsRecording] = useState(false)
    const [audioBlob, setAudioBlob] = useState(null)
    const mediaRecorder = useRef(null)
    const audioChunks = useRef([])

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            mediaRecorder.current = new MediaRecorder(stream)
            audioChunks.current = []

            mediaRecorder.current.ondataavailable = (event) => {
                audioChunks.current.push(event.data)
            }

            mediaRecorder.current.onstop = async () => {
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' })
                setAudioBlob(audioBlob)
                
                // Upload to S3
                const fileName = `voice-${Date.now()}.webm`
                const { key } = await Storage.put(fileName, audioBlob, {
                    contentType: 'audio/webm'
                })
                
                onVoiceRecorded(key)
            }

            mediaRecorder.current.start()
            setIsRecording(true)
        } catch (error) {
            console.error('Error accessing microphone:', error)
        }
    }

    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop()
            mediaRecorder.current.stream.getTracks().forEach(track => track.stop())
            setIsRecording(false)
        }
    }

    return (
        <Flex direction="row" gap="0.5rem">
            <Button
                onClick={isRecording ? stopRecording : startRecording}
                variation={isRecording ? "destructive" : "primary"}
            >
                {isRecording ? "Stop Recording" : "Record Voice"}
            </Button>
            {audioBlob && !isRecording && (
                <audio controls src={URL.createObjectURL(audioBlob)} />
            )}
        </Flex>
    )
} 