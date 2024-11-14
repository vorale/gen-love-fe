import { Button, Flex, TextField } from '@aws-amplify/ui-react'
import { useRef, useState } from 'react'
import { Storage } from 'aws-amplify'
import { VoiceRecorder } from '../VoiceRecorder/VoiceRecorder'

export const InputArea = ({ onMessageSend, messages = [], inputText, setInputText, onSuggestionsReceived, setIsSuggestionsOpen, setIsLoading,setGeneralText, isLoading}) => {
	const [selectedImage, setSelectedImage] = useState(null)
	const [lastAudioKey, setLastAudioKey] = useState(null)
	const fileInputRef = useRef(null)
	const [isSending, setIsSending] = useState(false)

	const getConversationHistory = () => {
		// Get last 3 messages only to keep context manageable
		return messages
			.slice(0, 3)  // Take only last 3 messages
			.reverse()    // Most recent messages first
			.map(msg => `${msg.owner}: ${msg.content?.text || ''}`.slice(0, 80)) // Limit each message to 80 chars
			.join('\n')   // Join with newlines
	}

	const uploadFile = async (selectedPic) => {
		const { key } = await Storage.put(selectedPic.name, selectedPic, {
				contentType: selectedPic.type,
		})
		return key
	}

	const handleVoiceRecorded = async (audioKey) => {
		setLastAudioKey(audioKey)
		onMessageSend('', audioKey, 'audio')
		
		await fetchSuggestions('')
	}

	// Helper function to ensure text is within limits
	const truncateToLimit = (text) => {
		return text.slice(-255);  // Take last 255 characters
	}

	const fetchSuggestions = async (newMessage, username) => {
		try {
			const conversationHistory = getConversationHistory()
			const fullText = truncateToLimit(`${conversationHistory}\n${newMessage}`)

			const bucketName = "amplifynextjschatappe467b698899b41e3b4b88ef2124"
			const s3Path = lastAudioKey ? `s3://${bucketName}/${lastAudioKey}` : ""
			console.log("newMessage", newMessage)
			const response = await fetch('http://35.77.89.181/v1/workflows/run', {
				method: 'POST',
				headers: {
					'Authorization': 'Bearer app-RmWlW1p1VAQilrrzmaQpMJaC',
					'Content-Type': 'application/json'
				},
				
				body: JSON.stringify({
					inputs: {
						text: newMessage,
						file_path: s3Path,
						username: username,
						"sys.files": [],
						"sys.user_id": "346ab516-948d-42e1-b54b-2b002ac93f86",
						"sys.app_id": "be3ed3f2-2419-48bf-a872-db27ad10760b",
						"sys.workflow_id": "64807ddc-cd37-4525-9944-a2ca6f697a1e",
						"sys.workflow_run_id": "54400afb-ffc5-4600-ad5f-2b165a12512b"
					},
					response_mode: "blocking",
					user: "abc-123"
				})
			});
			
			setLastAudioKey(null)
			
			const data = await response.json();
			if (data.error) {
				console.error('API Error:', data.error);
				return;
			}
			console.log("data?.data?.outputs?.result", data?.data?.outputs?.result)
			if (data?.data?.outputs?.result && (typeof data.data.outputs.result !== 'string' || data.data.outputs.result.indexOf("suggestions") !== -1)) {
				const resultData = JSON.parse(data.data.outputs.result);
				console.log("resultData", resultData)
				onSuggestionsReceived(resultData.suggestions);
				setGeneralText(resultData.general_context)
			}
		} catch (error) {
			console.error('Error fetching suggestions:', error);
		}
	};

	const handleSuggestionsOpen = async () => {
		setIsSuggestionsOpen(true)
		setIsLoading(true)
		const lastMsg = messages[0]
		console.log("lastMsg", messages)

		if(lastMsg && lastMsg.content && lastMsg.content.text) {
		// First API call for suggestions
		await fetchSuggestions(lastMsg.content.text,lastMsg.owner)

		// Second API call for the third suggestion
		try {
			const response = await fetch('http://35.77.89.181/v1/workflows/run', {
				method: 'POST',
				headers: {
					'Authorization': 'Bearer app-8nyFh08HKFaPNEFYvdwQIBqK',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					inputs: {
						user_input: inputText.trim()
					},
					response_mode: "blocking",
					user: lastMsg.owner
				})
			});

			let thirdSuggestion = '';
			const data = await response.json();
			if (data.error) {
				console.error('API Error:', data.error);
				return;
			}
			if (data?.data?.outputs?.text) {
				const resultData = data.data.outputs.text;
				// onSuggestionsReceived(resultData);
				
				onSuggestionsReceived(prevSuggestions => {
					const newSuggestions = [...(prevSuggestions || [])];
					newSuggestions[2] = resultData; // Set third suggestion
					return newSuggestions;
				});
			}

			

		} catch (error) {
			console.error('Error fetching streaming suggestion:', error);
		}
	}
		setIsLoading(false)
	}
	

	const handleFormSubmit = async (e) => {
		e.preventDefault()
		setIsSending(true)
		console.log("inputText", inputText)
		if(typeof inputText === 'array') inputText = inputText[0]
		if (!inputText.trim() && !selectedImage) return

		let key
		if (selectedImage) {
			key = await uploadFile(selectedImage)
			await onMessageSend(inputText.trim(), key, 'image')
		} else {
			await onMessageSend(inputText.trim())
		}

		setIsSending(false)

		// Clear input
		setInputText('')
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
		<Flex direction="column" padding="1rem" width="100%">
			<form onSubmit={handleFormSubmit} style={{ width: '100%' }}>
				<Flex 
					direction="row" 
					gap="0.5rem" 
					width="100%"
					 alignItems="center"
					justifyContent="space-between"
				>
					<TextField
						flex="1"
						width="50%"
						placeholder="Type your message..."
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
						onKeyPress={handleKeyPress}
						size="large"
						style={{
							minWidth: '75%',
							margintop:"-15px",
							height: '40px'
						}}
					/>
					<VoiceRecorder onVoiceRecorded={handleVoiceRecorded} />
					<Button 
						type="submit" 
						isLoading={isLoading}
						variation="primary"
						size="medium"
						onClick={() => handleSuggestionsOpen()}
						style={{
							width: '160px',
							height: '40px'
						}}
					>
						一点提示
					</Button>
					<Button 
						type="submit" 
						isLoading={isSending}
						variation="primary"
						size="medium"
						style={{
							width: '80px',
							height: '40px'
						}}
					>
						发送
					</Button>
				</Flex>
			</form>
		</Flex>
	)
}
