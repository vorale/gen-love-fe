import { Flex, TextAreaField } from '@aws-amplify/ui-react'
import { MessageItem } from './index'

export const MessageList = ({ messages = [], myUsername, suggestions = [], onSuggestionClick }) => {
	// console.log('MessageList received suggestions:', suggestions);
	// console.log('Current suggestions in MessageList:', suggestions);
	
	return (
		<>
			<Flex
				flex="1"
				backgroundColor="white"
				style={{ overflowY: 'scroll' }}
				direction="column-reverse"
				padding="5px"
				>
				{messages.map((msg) => (
					<MessageItem key={msg.id} msg={msg} myUsername={myUsername} />
				))}
			</Flex>
			
			<Flex
				direction="column"
				padding="0.5rem"
				backgroundColor="#f5f5f5"
				minHeight="25px"
				gap="0.25rem"
			>
				{[0, 1, 2].map((index) => (
					<TextAreaField
						key={index}
						isReadOnly={true}
						value={suggestions[index] || "Waiting for suggestions..."}
						backgroundColor="white"
						autoHeight={true}
						minHeight="16px"
						maxHeight="50px"
						padding="2px 8px"
						style={{
							resize: 'none',
							overflow: 'auto',
							lineHeight: '1.2',
							fontSize: '13px',
							border: '1px solid #ccc',
							borderRadius: '4px',
							marginBottom: '2px',
							cursor: 'pointer'
						}}
						onClick={() => {
							if (suggestions[index]) {
								onSuggestionClick(suggestions[index]);
							}
						}}
					/>
				))}
			</Flex>
		</>
	)
}
