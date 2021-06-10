import logo from './logo.svg';
import './App.css';
import React, {useState,useEffect} from 'react';

import { SkynetClient, Permission, PermCategory, PermType } from "skynet-js";
import CssBaseline from '@material-ui/core/CssBaseline';
import { Typography, Container, Button } from '@material-ui/core';
import 'bootstrap/dist/css/bootstrap.min.css';
import { makeStyles } from '@material-ui/core/styles';
import TodoList from "./components/TodoList";
import { ContentRecordDAC } from "@skynetlabs/content-record-library";


const portal = window.location.hostname === 'localhost' ? 'https://siasky.net' : undefined;
const client = new SkynetClient(portal);
const hostApp = 'localhost';
const dataDomain = 'localhost';

const contentRecord = new ContentRecordDAC();

const useStyles = makeStyles({
  loginDiv: {
    alignItems:'center'
  }
})

function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [userID, setUserID] = useState();
  const [mySky, setMySky] = useState();
  const [userData, setUserData] = useState();
  const [initMount, setInitMount] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setInitMount(false);
    },100)
  },[]);

  const initMySky = async () => {
    try {
      const mySky = await client.loadMySky(hostApp);

      await mySky.loadDacs(contentRecord);

      const checkLogIn = await mySky.checkLogin();
      console.log('CHECKED LOG IN : ', checkLogIn);
      setMySky(mySky);

      if (checkLogIn) {
        const usrId = await mySky.userID();
        setUserID(usrId);
        setLoggedIn(checkLogIn);

        console.log('USER ID: ', usrId);
      }

    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    initMySky();
  }, []);



  const initiateLogin = async () => {
    await mySky.addPermissions(new Permission('localhost', 'localhost/path', PermCategory.Discoverable, PermType.Write));
    mySky.requestLoginAccess().then(async result => {
      if (result) {
        setUserID(await mySky.userID());
        setLoggedIn(true);
      }
    });


  }
  const performLogout = async () => {
    if (!initMount) {
      //await mySky.logout();
    }

    //setLoggedIn(false);
    //setUserID('');
  }
  // background:`linear-gradient(to bottom right, #3035aa, #e57373)`
  const classes = useStyles();
  return (
      <Container maxWidth={false} style={{}}>
        <CssBaseline />

        <Container maxWidth={'sm'} style={{height: '100vh'}}>
          {loggedIn ? (
              <TodoList userID={userID} mySky={mySky} dataDomain={dataDomain} contentRecord={contentRecord}
                        performLogout={performLogout} />
          ):(
              <>
              <Typography align={'center'} component="h1" variant="h5">
                DoSky
              </Typography>
            <Typography align={'center'} variant="subtitle1">
            A simple and secure To-Do List built on Skynet.
            </Typography>
            <Button onClick={initiateLogin} fullWidth
            variant={'contained'} color={'primary'}>Login</Button>
              </>
          )}

        </Container>
      </Container>

  );
}

export default App;
