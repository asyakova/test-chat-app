import React, { useMemo, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import * as AdaptiveCards from 'adaptivecards';
import MarkdownIt from 'markdown-it';
import { Message } from '../types/types';

const md = new MarkdownIt();

const MessageComponent: React.FC<{ message: Message; darkMode: boolean }> = ({ message, darkMode }) => {
    const cardContainerRef = useRef<HTMLDivElement | null>(null);
    const isUser = message.role === 'user';

    const isJson = useMemo(() => {
        try {
            JSON.parse(message.content);
            return true;
        } catch (error) {
            return false;
        }
    }, [message.content]);

    useEffect(() => {
        if (isJson && cardContainerRef.current) {
            const card = new AdaptiveCards.AdaptiveCard();
            try {
                card.parse(JSON.parse(message.content));
                const renderedCard = card.render();
                cardContainerRef.current.innerHTML = '';
                cardContainerRef.current.appendChild(renderedCard);
            } catch (error) {
                console.error('Error rendering Adaptive Card:', error);
            }
        }
    }, [isJson, message.content]);

    if (isUser) {
        return (
            <Box
                sx={{
                    marginBottom: 2,
                    textAlign: 'right',
                    bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    borderRadius: 2,
                    padding: 1,
                }}
                className="relative !max-w-[70%] !rounded-3xl !ml-auto !mt-5 !mb-5 !p-3 w-fit"
            >
                <Typography variant="body1" color={darkMode ? 'rgba(255, 255, 255)' : 'rgba(0, 0, 0)'}>
                    {message.content}
                </Typography>
            </Box>
        );
    } else if (isJson) {
        return (
            <Box
                sx={{
                    marginBottom: 2,
                    textAlign: 'left',
                    borderRadius: 2,
                    padding: 1,
                }}
            >
                <div ref={cardContainerRef} />
            </Box>
        );
    } else {
        const markdownContent = md.render(message.content);
        return (
            <Box
                sx={{
                    marginBottom: 2,
                    textAlign: 'left',
                    borderRadius: 2,
                    padding: 1,
                }}
            >
                <Typography variant="body1" color="textSecondary" dangerouslySetInnerHTML={{ __html: markdownContent }} />
            </Box>
        );
    }
};

export default MessageComponent;
