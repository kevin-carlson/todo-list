import './App.css';
import React, {useState,useEffect} from 'react';

import { SkynetClient, Permission, PermCategory, PermType } from "skynet-js";
import CssBaseline from '@material-ui/core/CssBaseline';
import {Typography, Container, Button, CircularProgress} from '@material-ui/core';
import 'bootstrap/dist/css/bootstrap.min.css';
import { makeStyles, ThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import TodoList from "./components/TodoList";
import { ContentRecordDAC } from "@skynetlabs/content-record-library";
import logo from './resources/tasky_logo.png';

const portal = window.location.hostname === 'localhost' ? 'https://siasky.net' : undefined;
const client = new SkynetClient(portal);
const hostApp = 'localhost';
const dataDomain = 'localhost';

const contentRecord = new ContentRecordDAC();

const useStyles = makeStyles({
  loginDiv: {
    alignItems:'center'
  }
});
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#4e8df5',
    },
    secondary: {
      main: '#fbc014'
    }
  }
});
const themeDark = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#4e8df5',
    },
    secondary: {
      main: '#fbc014'
    }
  }
});

function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [userID, setUserID] = useState();
  const [mySky, setMySky] = useState();
  const [userData, setUserData] = useState();
  const [initMount, setInitMount] = useState(true);
  const [isLoading, setLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState(theme);

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
      setMySky(mySky);

      if (checkLogIn) {
        const usrId = await mySky.userID();
        setUserID(usrId);
        getInitData(mySky, usrId);
      } else {
        setLoading(false);
      }

    } catch (e) {
      console.log(e);
    }
  }
  const getInitData = async (mySky, usrID) => {
    try {
      const { data, dataLink } = await mySky.getJSON(dataDomain+'/path/'+usrID.toString()+'.json');
      if (data==null) {
        setInitData(mySky, usrID);
      } else {
        setUserData(data);
        //setUserName(data.userName);
        if(data.userTheme=='dark') {
          setCurrentTheme(themeDark);
          //setValue(data.defaultTab);
          //setDefaultTab(data.defaultTab);
        }
        setLoggedIn(true);
        setLoading(false);
      }
    } catch (e) {
      console.log('error retrieving JSON: ', e);
    }
  }
  const setInitData = async (mySky, usrID) => {
    try {
      const initJSON = {
        defaultTab: 0,
        userTheme: 'light',
        userName: 'New User',
        todoItems: [
          {
            text: "Use TaSky!",
            date: (new Date).toISOString(),
            memo: "Start organizing your tasks using TaSky",
            completed: false,
            pinned: true
          }
        ]
      };
      setUserData(initJSON);
      //dataDomain+'/path/test.json'
      const {data, dataLink } = await mySky.setJSON(dataDomain+'/path/'+usrID.toString()+'.json', initJSON);
      //setOpenModal(true);
      setLoggedIn(true);
      setLoading(false);
    } catch (e) {
      console.log('SET ERR: ', e);
    }
  }

  useEffect(() => {
    initMySky();
  }, []);



  const initiateLogin = async () => {
    await mySky.addPermissions(new Permission('localhost', 'localhost/path', PermCategory.Discoverable, PermType.Write));
    mySky.requestLoginAccess().then(async result => {
      if (result) {
        setLoading(true);
        const usrID = await mySky.userID();
        getInitData(mySky, usrID);
        setUserID(usrID);
      }
    });


  }

  const performLogout = async () => {
    await mySky.logout();
    setLoggedIn(false);
    setUserID('');
  }
  const changeTheme = async () => {
    if (currentTheme.palette.type==='light') {
      setCurrentTheme({...themeDark});
    } else {
      setCurrentTheme({...theme});
    }

  }
  const classes = useStyles();
  return (
      <ThemeProvider theme={currentTheme}>
        <Container maxWidth={false}>
          <CssBaseline />

          <Container maxWidth={'sm'} style={{height: '100vh'}}>
            {loggedIn ? (
                <TodoList userID={userID} mySky={mySky} dataDomain={dataDomain} contentRecord={contentRecord} changeTheme={changeTheme}
                          currentTheme={currentTheme} data={userData} performLogout={performLogout} />
            ):(
                <>
                  <div style={{display:'flex', width:'100%', alignItems:'center', justifyContent:'center'}}>
                    <img src={logo} style={{height:120, aspectRatio:1, margin:4, marginTop:14}}/>
                  </div>
                  <Typography color={'primary'} align={'center'} component="h1" variant="h3">
                    TaSky
                  </Typography>
                  <Typography align={'center'} variant="subtitle1">
                    A simple and secure To-Do List built on Skynet.
                  </Typography>
                  {isLoading ? (
                      <div style={{display:'flex', alignContent:'center', justifyContent:'center', margin:14}}>
                        <CircularProgress/>
                      </div>
                  ):(
                      <div style={{display:'flex', alignContent:'center', justifyContent:'center', margin:14, paddingLeft:15, paddingRight:15}}>
                        <Button onClick={initiateLogin} fullWidth
                              variant={'contained'} color={'primary'}>Login</Button>
                      </div>
                  )}

                </>
            )}

          </Container>
        </Container>
      </ThemeProvider>
  );
}

export default App;
