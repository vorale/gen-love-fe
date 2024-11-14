import { Button, Flex, TextField } from '@aws-amplify/ui-react'
import { useRef, useState } from 'react'
import { Storage } from 'aws-amplify'
import { VoiceRecorder } from '../VoiceRecorder/VoiceRecorder'

export const InputArea = ({ onMessageSend }) => {
	const [selectedImage, setSelectedImage] = useState(null)
	const [messageText, setMessageText] = useState('')
	const fileInputRef = useRef(null)

	const uploadFile = async (selectedPic) => {
		const { key } = await Storage.put(selectedPic.name, selectedPic, {
			contentType: selectedPic.type,
		})
		return key
	}

	const handleVoiceRecorded = async (audioKey) => {
		onMessageSend('', audioKey, 'audio')
	}

	const handleFormSubmit = async (e) => {
		e.preventDefault()
		if (!messageText.trim() && !selectedImage) return

		let key
		if (selectedImage) {
			key = await uploadFile(selectedImage)
			onMessageSend(messageText.trim(), key, 'image')
		} else {
			onMessageSend(messageText.trim())
		}

		setMessageText('')
		setSelectedImage(null)
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	const handleKeyPress = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {  // Allow Shift+Enter for new lines
			e.preventDefault()
			handleFormSubmit(e)
		}
	}

	return (
		<Flex direction="column" padding="1rem" gap="1rem">
			<form onSubmit={handleFormSubmit}>
				<Flex direction="row" gap="1rem">
					<TextField
						flex="1"
						placeholder="Type your message..."
						value={messageText}
						onChange={(e) => setMessageText(e.target.value)}
						onKeyPress={handleKeyPress}
					/>
					<TextField
						ref={fileInputRef}
						type="file"
						onChange={(e) => setSelectedImage(e.target.files[0])}
					/>
					<Button type="submit" variation="primary">
						Send
					</Button>
				</Flex>
			</form>
			<VoiceRecorder onVoiceRecorded={handleVoiceRecorded} />
		</Flex>
	)
}
