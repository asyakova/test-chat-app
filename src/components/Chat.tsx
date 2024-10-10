import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, InputAdornment, Typography, Switch, CssBaseline, ThemeProvider } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { darkTheme, lightTheme } from '../theme';
import { Message } from '../types/types';
import MessageComponent from './MessageComponent';
import openai from '../openaiClient';

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [darkMode, setDarkMode] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentStreamContent, setCurrentStreamContent] = useState<string>('');

    useEffect(() => {
        function hideError(e: { message: string }) {
            if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
                const resizeObserverErrDiv = document.getElementById('webpack-dev-server-client-overlay-div');
                const resizeObserverErr = document.getElementById('webpack-dev-server-client-overlay');
                if (resizeObserverErr) {
                    resizeObserverErr.setAttribute('style', 'display: none');
                }
                if (resizeObserverErrDiv) {
                    resizeObserverErrDiv.setAttribute('style', 'display: none');
                }
            }
        }

        window.addEventListener('error', hideError);
        return () => {
            window.removeEventListener('error', hideError);
        };
    }, []);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');

        setLoading(true);
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: input }],
                stream: true,
            });

            let assistantMessage: Message = { role: 'assistant', content: '' };
            for await (const chunk of response) {
                const { choices } = chunk;
                if (choices && choices.length > 0) {
                    const deltaContent = choices[0].delta.content || '';
                    assistantMessage.content += deltaContent;
                    setCurrentStreamContent(assistantMessage.content);
                }
            }

            setMessages((prev) => [...prev, assistantMessage]);
            setCurrentStreamContent('');
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        } else {
            setInput((e.target as HTMLInputElement).value);
        }
    };

    return (
        <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
            <CssBaseline />
            <Box sx={{ padding: 2, maxWidth: 600, margin: '0 auto' }}>
                <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                <Box
                    sx={{
                        maxHeight: 'calc(100vh - 150px)',
                        minHeight: 'calc(100vh - 150px)',
                        overflowY: 'auto',
                        padding: 2,
                        '&::-webkit-scrollbar': {
                            width: '1px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: '#888',
                            borderRadius: '10px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            backgroundColor: '#555',
                        },
                        scrollbarWidth: 'thin',
                    }}
                >
                    {messages.map((message, index) => (
                        <MessageComponent key={index} message={message} darkMode={darkMode} />
                    ))}
                    {loading && currentStreamContent && (
                        <Box sx={{ marginBottom: 2, textAlign: 'left', borderRadius: 2, padding: 1 }}>
                            <Typography variant="body1" color="textSecondary">
                                {currentStreamContent}
                            </Typography>
                        </Box>
                    )}
                </Box>
                <TextField
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleInputChange}
                    fullWidth
                    multiline
                    placeholder="Type a message..."
                    className="flex w-full flex-col gap-1.5 !rounded-[26px] p-1.5 transition-colors  dark:bg-token-main-surface-secondary"
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    {input.trim() !== '' ? (
                                        <Button
                                            onClick={handleSend}
                                            disabled={loading}
                                            sx={{
                                                minWidth: 0,
                                                backgroundColor: 'black',
                                                color: 'white',
                                                borderRadius: '50%',
                                                width: '40px',
                                                height: '40px',
                                                '&:hover': {
                                                    backgroundColor: 'black',
                                                },
                                            }}
                                        >
                                            <ArrowUpwardIcon />
                                        </Button>
                                    ) : (
                                        <Button
                                            disabled
                                            sx={{
                                                minWidth: 0,
                                                backgroundColor: '#E0E0E0',
                                                color: '#B0B0B0',
                                                borderRadius: '50%',
                                                width: '40px',
                                                height: '40px',
                                            }}
                                        >
                                            <ArrowUpwardIcon />
                                        </Button>
                                    )}
                                </InputAdornment>
                            ),
                        },
                    }}
                    sx={{
                        bgcolor: darkMode ? 'rgb(47, 47, 47)' : 'rgb(244, 244, 244)',

                        '& .MuiOutlinedInput-root': {
                            border: 'none',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none',
                        },
                        '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                            border: 'none',
                        },
                    }}
                />
            </Box>
        </ThemeProvider>
    );
};

export default Chat;
