import React, { useEffect } from "react";
import axios from "axios";
import { getUserPlaylists, getPlaylistTracks } from "../../spotify";
import { useSelector, useDispatch } from "react-redux";
import { ApplicationDispatch } from "../../store";
import { PersonalPageState } from "../../state";
import style from "./Playlists.module.scss";
import { useRefreshedSession } from "../../hooks/useRefreshedSession";

export default function() {
  const refreshedSession = useRefreshedSession();
  const playlists = useSelector((state: PersonalPageState) => state.playlists);
  const selectedPlaylistId = useSelector((state: PersonalPageState) => state.selectedPlaylistId);
  const dispatch = useDispatch<ApplicationDispatch>();
  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    refreshedSession.then(
      ({ accessToken }) => getUserPlaylists(accessToken, cancelTokenSource.token)
    ).then(playlists => {
      dispatch({
        type: "SET_PLAYLISTS",
        value: playlists
      });
    }).catch(e => {
      if (!axios.isCancel(e)) {
        console.error(`Failed to fetch user playlists: ${e}`);
      }
    });
    return () => cancelTokenSource.cancel();
  }, [refreshedSession, dispatch]);

  // Load tracks from selected playlist.
  useEffect(() => {
    if (selectedPlaylistId) {
      const cancelTokenSource = axios.CancelToken.source();
      refreshedSession.then(
        ({ accessToken }) => getPlaylistTracks(selectedPlaylistId, accessToken, cancelTokenSource.token)
      ).then(tracks => dispatch({
        type: "SET_TRACKS",
        value: tracks
      })).catch(e => {
        if (!axios.isCancel(e)) {
          console.error(`Failed to fetch playlist tracks: ${e}`);
        }
      });

      return () => cancelTokenSource.cancel();
    }
  }, [selectedPlaylistId, refreshedSession, dispatch]);

  async function selectPlaylist(id: string) {
    dispatch({
      type: "START_FETCHING_TRACKS",
      playlistId: id
    });
  }

  return (
    <div>
      <h3>Playlists</h3>
      <div className={style.container}>
        {playlists.map(playlist => (
          <div
            key={playlist.id}
            className={style.item}
            onClick={() => selectPlaylist(playlist.id)}
          >
            {playlist.name}
          </div>
        ))}
      </div>
    </div>
  );
}
