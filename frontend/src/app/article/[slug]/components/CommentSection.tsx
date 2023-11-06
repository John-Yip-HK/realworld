import path from 'path';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaSpinner } from "react-icons/fa6";
import { FaHandPaper } from "react-icons/fa";
import { clsx } from 'clsx';

import { getLocaleString } from '@/app/lib/utils';
import { addCommentServerAction, deleteCommentServerAction } from '@/app/lib/server-actions/article';

import { PROFILE_NAV_PATH } from '@/app/constants/profile';
import { LOGIN_NAV_PATH, SIGN_UP_PATH } from '@/app/constants/user';

import './styles.scss';

type AddCommentFormMessage = Partial<UnexpectedError> | Partial<UnauthorizedError> | void;

const initialMessage: AddCommentFormMessage = {};

type CommentSectionProps = {
  isLoggedIn: boolean;
  comments: Comment[];
  username: string;
  articleSlug: string;
  userImageUrl: string;
}

export default function CommentSection({
  isLoggedIn,
  comments,
  username,
  articleSlug,
  userImageUrl,
}: CommentSectionProps) {
  const [_, formAction] = useFormState<AddCommentFormMessage, FormData>(addCommentServerAction, initialMessage);
  
  return (
    <div className="row">
      <div className="col-xs-12 col-md-8 offset-md-2">
        {
          isLoggedIn ? (
            <>
              <form className="card comment-form" action={formAction}>
                <input 
                  type="hidden" 
                  name="article-slug" 
                  value={articleSlug} 
                />
                <CommentFormFields
                  username={username}
                  userImageUrl={userImageUrl}
                />
              </form>
              {comments.map((comment) => (
                <Comment
                  comment={comment}
                  key={comment.id}
                  articleSlug={articleSlug}
                  currUsername={username}
                />
              ))}
            </>
          ) : 
          <p>
            <Link href={LOGIN_NAV_PATH}>Sign in</Link> or <Link href={SIGN_UP_PATH}>sign up</Link> to add comments on this article.
          </p>
        }
      </div>
    </div>
  )
}

function CommentFormFields({
  username,
  userImageUrl,
}: Pick<CommentSectionProps, 'userImageUrl' | 'username'>) {
  const { pending: submittingComment } = useFormStatus();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!submittingComment && textAreaRef.current) {
      textAreaRef.current.value = '';
    }
  }, [submittingComment]);
  
  return (
    <fieldset disabled={submittingComment}>
      <div className="card-block">
        <textarea
          ref={textAreaRef}
          name="comment-body"
          className="form-control"
          placeholder="Write a comment..." 
          rows={3}
        />
      </div>
      <div className="card-footer">
        <Image 
          src={userImageUrl}className="comment-author-img"
          alt={`Icon of user ${username}`}
          width={30}
          height={30}
        />
        <button className="btn btn-sm btn-primary" type="submit">Post Comment</button>
      </div>
    </fieldset>
  )
}

function Comment({ 
  comment, 
  articleSlug, 
  currUsername,
}: { 
  comment: Comment; 
  articleSlug: string; 
  currUsername: string; 
}) {
  const { id, body, createdAt, author: { image, username } } = comment;
  const commentAuthorProfilePath = path.join(PROFILE_NAV_PATH, username);
  const commentCreatedAt = getLocaleString(createdAt);
  
  const [deletingArticle, setDeletingArticle] = useState(false);
  const [deletionCompleted, setDeletionCompleted] = useState(false);
  
  const handleDeleteArticle = async () => {
    setDeletingArticle(true);
    await deleteCommentServerAction(articleSlug, id);
    setDeletingArticle(false);

    setDeletionCompleted(true);
  };
  const disableDeleteBtn = deletingArticle || deletionCompleted;
  const canDeleteComment = currUsername === username;
  
  return (
    <div className="card">
      <div className="card-block">
        <p className="card-text">
          {body}
        </p>
      </div>
      <div className="card-footer">
        <Link href={`/profile/${username}`} className="comment-author">
          <Image 
            src={image} 
            className="comment-author-img" 
            alt={`Icon of comment author ${username}`}
            width={20}
            height={20}
          />
        </Link>
        &nbsp;
        <Link href={commentAuthorProfilePath} className="comment-author">{username}</Link>
        <span className="date-posted">{commentCreatedAt}</span>
        {
          canDeleteComment ?
            <button
              className={clsx(
                'delete-bin-float-right', 
                disableDeleteBtn ? 'disable-btn' : undefined,
              )}
              onClick={handleDeleteArticle}
              disabled={disableDeleteBtn}
            >
              {
                deletingArticle ?
                  <FaSpinner className="spinner" /> :
                  (
                    deletionCompleted ?
                      <FaHandPaper className="waving-hand" /> :
                      <RiDeleteBin6Line />
                  )
              }
            </button> :
            null
        }
      </div>
    </div>
  );
}
