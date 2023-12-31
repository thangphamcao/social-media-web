import {
    Box,
    Avatar,
    Typography,
    CardMedia,
    Card,
    TextField,
    CardHeader,
    IconButton,
    CardContent,
    CardActions,
    Skeleton,
    InputAdornment,
    ImageList,
    ImageListItem,
} from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import ShareIcon from '@mui/icons-material/Share';
import ImageIcon from '@mui/icons-material/Image';
import SendIcon from '@mui/icons-material/Send';
import CancelIcon from '@mui/icons-material/Cancel';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Fragment, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { IComment, IDetailPost, ILike } from '../../interface/post';
import { useCommentPost, useGetAllPost, useGetCommentPost, useLikePost, useUpdateCommentPost } from '../../hook';
import { IUser } from '../../interface';
import MenuComment from '../Menu/comment';
import { useQueryClient } from 'react-query';

interface IPropsPosts {
    user: IUser | null;
}

const Posts = (props: IPropsPosts) => {
    const [input, setInput] = useState<string | undefined>(undefined);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [hoverItem, setHoverItem] = useState<number | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isEdit, setIsEdit] = useState<{ commentID: string; postID: string }>({ commentID: '', postID: '' });
    const [isUpdate, setIsUpdate] = useState<boolean>(false);

    const textFieldRef = useRef<HTMLElement | null>(null);

    const queryClient = useQueryClient();

    const open = Boolean(anchorEl);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formData: any = new FormData();

    const { user } = props;

    const { isLoading, isFetched, data } = useGetAllPost();

    const { mutate } = useLikePost();

    const handleSuccess = (data: { data: IComment }) => {
        setIsUpdate(true);
        const inputText = data.data.comment === 'undefined' ? '' : data.data.comment;

        setInput(inputText!);

        if (data.data.image) {
            const url = `http://localhost:5000/gallery/${user?.id}/${data.data.image.filename}`;
            setPreviewImage(url);
        }
        textFieldRef.current?.focus();
    };
    console.log(isUpdate);

    const hanleSuccessComment = () => {
        queryClient.invalidateQueries('posts');
        setInput('');
        setPreviewImage(null);
        URL.revokeObjectURL(previewImage!);
    };
    const getCommentPost = useGetCommentPost(isEdit.commentID, isEdit.postID, handleSuccess);

    const comment = useCommentPost(hanleSuccessComment);

    const handleUpdateCommentPost = useUpdateCommentPost(hanleSuccessComment);

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };
    const handleLikePost = async (id: string) => {
        mutate(id);
    };

    const openEdit = (data: { commentID: string; postID: string }) => {
        console.log(isEdit);
        setIsEdit(data);
        getCommentPost.refetch();
    };

    const handleClick = (event: React.MouseEvent<HTMLElement>, id: string, postID: string) => {
        setAnchorEl(event.currentTarget);
        setIsEdit({ commentID: id, postID: postID });
    };

    const handleComment = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const selectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) {
            return;
        } else {
            setSelectedImage(e.target.files[0]);
            const url = URL.createObjectURL(e.target.files[0]);
            setPreviewImage(url);
        }
    };

    const submitComment = async (id: string) => {
        // console.log(updateID);
        if (input !== null && selectedImage !== null) {
            formData.append('comment', input);
            formData.append('commentImg', selectedImage, selectedImage!.name);
        } else if (input !== null && selectedImage === null) {
            formData.append('comment', input);
        } else {
            formData.append('commentImg', selectedImage, selectedImage!.name);
        }
        if (isUpdate) {
            const updateID = {
                formData: formData,
                id: {
                    commentID: isEdit.commentID,
                    postID: isEdit.postID,
                },
            };

            handleUpdateCommentPost.mutate(updateID);
        } else {
            const data = {
                formData: formData,
                id: {
                    postID: id,
                },
            };
            comment.mutate(data);
        }
        setIsUpdate(false);
    };

    const handleClose = () => {
        if (previewImage) {
            URL.revokeObjectURL(previewImage);
        }
        setSelectedImage(null);
        setPreviewImage(null);
    };

    const handleMouseEnter = (index: number) => {
        setHoverItem(index);
    };

    const handleMouseLeave = () => {
        setHoverItem(null);
    };

    return (
        <Fragment>
            {isFetched &&
                data.map((item: IDetailPost, index: number) => (
                    <Box className="my-4 w-full" key={item._id}>
                        <Card sx={{ width: '100%', paddingBottom: '8px', borderRadius: '10px' }}>
                            <CardHeader
                                avatar={
                                    isLoading ? (
                                        <Skeleton animation="wave" variant="circular" width={40} height={40} />
                                    ) : (
                                        <Avatar
                                            alt="Avatar"
                                            src={
                                                item.author.avatar
                                                    ? `http://localhost:5000/gallery/${item?.author._id}/${item.author.avatar.image}`
                                                    : ''
                                            }
                                            sx={{ marginLeft: '10px', cursor: 'pointer' }}
                                        />
                                    )
                                }
                                action={
                                    isLoading ? (
                                        <IconButton aria-label="settings">
                                            <MoreVertIcon />
                                        </IconButton>
                                    ) : (
                                        <IconButton>
                                            <MoreVertIcon></MoreVertIcon>
                                        </IconButton>
                                    )
                                }
                                title={
                                    isLoading ? (
                                        <Skeleton
                                            animation="wave"
                                            height={10}
                                            width="20%"
                                            style={{ marginBottom: 6 }}
                                        />
                                    ) : (
                                        item.author?.displayName
                                    )
                                }
                                subheader={
                                    isLoading ? (
                                        <Skeleton animation="wave" height={10} width="30%" />
                                    ) : (
                                        dayjs(item.createdAt).format('DD/MM/YYYY')
                                    )
                                }
                            ></CardHeader>
                            {(isLoading && (
                                <CardContent sx={{ paddingTop: '0', paddingLeft: '30px' }}>
                                    <Skeleton animation="wave" height={10} width="20%" style={{ marginBottom: 6 }} />
                                </CardContent>
                            )) ||
                                (item.title && (
                                    <CardContent sx={{ paddingTop: '0', paddingLeft: '30px' }}>
                                        <Typography variant="body1">{item.title}</Typography>
                                    </CardContent>
                                ))}

                            {isLoading ? (
                                <Skeleton sx={{ height: 300 }} animation="wave" variant="rectangular" />
                            ) : (
                                <CardMedia
                                    component="img"
                                    image={
                                        item.image.length > 0
                                            ? `http://localhost:5000/gallery/${item?.author._id}/${item.image[0].filename}`
                                            : ''
                                    }
                                    sx={{ width: '100%', height: '100%' }}
                                ></CardMedia>
                            )}

                            <Box className=" border-b-2 mx-2">
                                <CardActions>
                                    <Box className="flex justify-between w-full ">
                                        <Box>
                                            <IconButton
                                                aria-label="add to favorites"
                                                onClick={() => handleLikePost(item._id as string)}
                                            >
                                                <FavoriteIcon
                                                    key={index}
                                                    sx={item.like.map((data: ILike) =>
                                                        data.isLike && data.user === user?.id
                                                            ? {
                                                                  color: 'red',
                                                              }
                                                            : { color: 'rgba(0, 0, 0, 0.54)' },
                                                    )}
                                                />
                                            </IconButton>

                                            <IconButton aria-label="message">
                                                <ChatBubbleIcon />
                                            </IconButton>
                                            <IconButton aria-label="share">
                                                <ShareIcon />
                                            </IconButton>
                                            {item.like.length > 0 ? (
                                                <Typography fontSize={14} fontWeight={500} className="px-3">
                                                    {item.like.length + ' lượt thích'}
                                                </Typography>
                                            ) : (
                                                <Fragment></Fragment>
                                            )}
                                        </Box>
                                        <Box className="items-end text-right">
                                            <IconButton aria-label="mark">
                                                <BookmarkIcon />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </CardActions>
                            </Box>
                            {item.comment.length > 0 &&
                                item.comment.map((comment: IComment, index: number) => (
                                    <Box className="mt-2" key={index}>
                                        <Box className="flex items-center px-2" onMouseLeave={handleMouseLeave}>
                                            <Avatar
                                                alt="Avatar"
                                                src={
                                                    comment.user.avatar
                                                        ? `http://localhost:5000/gallery/${comment.user._id}/${comment.user.avatar.image}`
                                                        : ''
                                                }
                                                sx={{
                                                    marginLeft: '10px',
                                                    marginRight: '10px',
                                                    cursor: 'pointer',
                                                }}
                                            />
                                            <Box
                                                onMouseEnter={() => handleMouseEnter(index)}
                                                className={
                                                    comment.comment
                                                        ? ' rounded-2xl bg-gray-100  py-2 px-4 cursor-pointer my-2 '
                                                        : ' rounded-2x  py-2 px-4 cursor-pointer my-2'
                                                }
                                            >
                                                <Typography fontWeight={700} fontSize={14}>
                                                    {comment.user.displayName}
                                                </Typography>
                                                <Typography fontSize={14}>
                                                    {comment.comment !== 'undefined' && comment.comment}
                                                </Typography>
                                            </Box>

                                            <Box
                                                onClick={(event: React.MouseEvent<HTMLElement>) =>
                                                    handleClick(event, comment._id, item._id as string)
                                                }
                                                onMouseLeave={handleMouseLeave}
                                            >
                                                <Box className={hoverItem === index ? 'block' : 'hidden'}>
                                                    <IconButton size="small">
                                                        <MoreHorizIcon />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        </Box>
                                        {comment.image && (
                                            <Box className=" px-16">
                                                <CardMedia
                                                    component="img"
                                                    image={`http://localhost:5000/gallery/${comment.user._id}/${comment.image.filename}`}
                                                    sx={{
                                                        width: '210px',
                                                        height: '210px',
                                                        borderRadius: '16px',
                                                        objectFit: 'contain',
                                                    }}
                                                ></CardMedia>
                                            </Box>
                                        )}
                                    </Box>
                                ))}

                            <Box className="flex flex-col">
                                <Box className="flex items-center pr-4 my-4">
                                    <Avatar
                                        alt="Avatar"
                                        src={
                                            user?.avatar
                                                ? `http://localhost:5000/gallery/${user.id}/${user.avatar}`
                                                : ''
                                        }
                                        sx={{ marginLeft: '10px', marginRight: '10px', cursor: 'pointer' }}
                                    />
                                    <TextField
                                        id="outlined-basic"
                                        variant="outlined"
                                        size="small"
                                        placeholder="Write your comment..."
                                        className="w-full border-0 rounded-lg"
                                        multiline={true}
                                        defaultValue={''}
                                        // autoFocus={isUpdate}
                                        value={input}
                                        inputRef={textFieldRef}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleComment(e)}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton component="label" sx={{ color: 'grey' }}>
                                                        <ImageIcon />
                                                        <input
                                                            type="file"
                                                            hidden
                                                            multiple
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                                selectImage(e)
                                                            }
                                                        />
                                                    </IconButton>
                                                    <IconButton
                                                        sx={{ color: '#44c0d8' }}
                                                        onClick={() => submitComment(item._id as string)}
                                                    >
                                                        <SendIcon />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Box>
                                {previewImage && (
                                    <Box className="flex justify-between pl-16 pr-4">
                                        <ImageList>
                                            <ImageListItem sx={{ width: '102px', height: '130px' }}>
                                                <img className="w-[100px]" alt="listImage" src={previewImage} />
                                            </ImageListItem>
                                        </ImageList>
                                        <Box className="self-start">
                                            <IconButton size="small" onClick={handleClose}>
                                                <CancelIcon />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Card>
                    </Box>
                ))}
            {isFetched && (
                <Box className="mb-4 flex justify-center">
                    <FiberManualRecordIcon sx={{ color: 'black' }}></FiberManualRecordIcon>
                    <Typography>Nothing's new on the feed!</Typography>
                </Box>
            )}
            <MenuComment
                isEdit={isEdit}
                open={open}
                handleCloseMenu={handleCloseMenu}
                anchorEl={anchorEl}
                openEdit={openEdit}
            />
        </Fragment>
    );
};

export default Posts;
