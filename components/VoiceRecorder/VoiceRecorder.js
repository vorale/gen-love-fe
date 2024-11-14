import { Button, Flex, Image, Text } from '@aws-amplify/ui-react'
import { useState, useRef, useEffect } from 'react'
import { Storage } from 'aws-amplify'
import styles from './VoiceRecorder.module.css'

export const VoiceRecorder = ({ onVoiceRecorded }) => {
    const [isRecording, setIsRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [isPulsing, setIsPulsing] = useState(false)
    const mediaRecorder = useRef(null)
    const audioChunks = useRef([])
    const timerRef = useRef(null)

    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1)
            }, 1000)
        } else {
            clearInterval(timerRef.current)
            setRecordingTime(0)
        }

        return () => clearInterval(timerRef.current)
    }, [isRecording])

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            mediaRecorder.current = new MediaRecorder(stream)
            audioChunks.current = []

            mediaRecorder.current.ondataavailable = (event) => {
                audioChunks.current.push(event.data)
            }

            mediaRecorder.current.onstop = async () => {
                try {
                    const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' })
                    
                    // if (isRecording) {
                        const fileName = `voice-${Date.now()}.webm`
                        try {
                            console.log('Attempting to upload audio to S3...');
                            const { key } = await Storage.put(fileName, audioBlob, {
                                contentType: 'audio/webm',
                                metadata: {
                                    'duration': String(recordingTime),
                                    'content-type': 'audio/webm'
                                },
                                progressCallback: (progress) => {
                                    console.log(`Upload progress: ${progress.loaded}/${progress.total}`);
                                }
                            });
                            
                            console.log('Successfully uploaded audio to S3 with key:', key);
                            onVoiceRecorded(key);
                        } catch (uploadError) {
                            console.error('Detailed S3 upload error:', uploadError);
                            console.error('Error name:', uploadError.name);
                            console.error('Error message:', uploadError.message);
                            console.error('Error stack:', uploadError.stack);
                        }
                    // }
                } catch (error) {
                    console.error('Error processing audio:', error);
                } finally {
                    audioChunks.current = [];
                    setIsRecording(false);
                    setIsPulsing(false);
                    
                    if (mediaRecorder.current && mediaRecorder.current.stream) {
                        mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
                    }
                }
            }

            mediaRecorder.current.start()
            setIsRecording(true)
            setIsPulsing(true)
        } catch (error) {
            console.error('Error accessing microphone:', error)
            setIsRecording(false)
            setIsPulsing(false)
        }
    }

    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop()
            mediaRecorder.current.stream.getTracks().forEach(track => track.stop())
            setIsRecording(false)
            setIsPulsing(false)
        }
    }

    const cancelRecording = () => {
        setIsRecording(false)
        setIsPulsing(false)
        if (mediaRecorder.current) {
            mediaRecorder.current.stop()
            mediaRecorder.current.stream.getTracks().forEach(track => track.stop())
        }
        audioChunks.current = []
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <Flex direction="row" gap="0.5rem" alignItems="center" className={styles.voiceRecorder}>
            <Button
                onClick={isRecording ? stopRecording : startRecording}
                className={`${styles.recordButton} ${isPulsing ? 'pulse-animation' : ''}`}
            >
                <Image
                    src={isRecording ? "/mic-recording.png" : "/mic-idle.png"}
                    alt={isRecording ? "Stop Recording" : "Start Recording"}
                    style={{
                        width: '24px',
                        height: '24px'
                    }}
                />
            </Button>

            {isRecording && (
                <>
                    <Text className={styles.recordingTimer}>
                        {formatTime(recordingTime)}
                    </Text>
                    <Button
                        onClick={cancelRecording}
                        className={styles.cancelButton}
                    >
                        <Image
                            src="/cancel.png"
                            alt="Cancel"
                            style={{
                                width: '20px',
                                height: '20px'
                            }}
                        />
                    </Button>
                </>
            )}
        </Flex>
    )
} 