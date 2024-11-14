import { Flex, Text, Image } from '@aws-amplify/ui-react'
import { Storage } from 'aws-amplify'
import { useEffect, useState } from 'react'

export const MessageItem = ({ msg, myUsername }) => {
	const [mediaUrl, setMediaUrl] = useState(null)

	useEffect(() => {
		const getMediaUrl = async () => {
			if (msg?.content?.imageId || msg?.content?.audioId) {
				const key = msg.content.imageId || msg.content.audioId
				try {
					const url = await Storage.get(key)
					setMediaUrl(url)
				} catch (error) {
					console.error('Error fetching media:', error)
				}
			}
		}
		getMediaUrl()
	}, [msg])

	console.log('Message object:', msg)

	if (!msg) return null

	return (
		<Flex
			direction="column"
			padding="1rem"
			backgroundColor={msg.owner === myUsername ? '#e3f2fd' : '#f5f5f5'}
			borderRadius="medium"
			marginBottom="0.5rem"
		>
			<Text fontWeight="bold">{msg.owner}</Text>
			{msg?.content?.text && <Text>{msg.content.text}</Text>}
			{msg?.content?.imageId && mediaUrl && (
				<Image src={mediaUrl} alt="Message attachment" maxWidth="300px" />
			)}
			{msg?.content?.audioId && mediaUrl && (
				<audio controls src={mediaUrl} />
			)}
		</Flex>
	)
}
