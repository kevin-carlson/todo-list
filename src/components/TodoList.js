import React, {useState,useEffect} from 'react';

import { SkynetClient } from "skynet-js";
import CssBaseline from '@material-ui/core/CssBaseline';
import {
    Typography,
    Container,
    Button,
    AppBar,
    Tabs,
    Tab,
    IconButton,
    Card,
    TextField,
    Grid,
    Modal, makeStyles
} from '@material-ui/core';
import 'bootstrap/dist/css/bootstrap.min.css';
import testData from '../resources/testData.json';
import TabPanel from "./TabPanel";
import {Edit} from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
        modal: {
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
        },
        modalCard: {
            alignItems:'center'
        },
}));

export default function TodoList (props) {
    const mySky = props.mySky;
    const userID = props.userID;
    const dataDomain = props.dataDomain;
    const contentRecord = props.contentRecord;
    const performLogout = props.performLogout();
    const [value, setValue] = useState(0);
    const [userData, setUserData] = useState({userName:' ', todoItems:[{pinned:null}]});
    const [isLoading, setLoading] = useState(true);
    const classes = useStyles();
    const [openModal, setOpenModal] = useState(false);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        //here we retrieve json with the users list of to-dos
        console.log('TEST DATA', testData)
        getInitData();
    },[]);

    const getInitData = async () => {
        try {
            console.log('USERID: ', userID);
            const { data, dataLink } = await mySky.getJSON(dataDomain+'/path/'+userID.toString()+'.json');
            console.log('DATA RETRIEVED: ', data);
            console.log('retrieved link: ', dataLink);
            if (data==null) {
                setInitData();
            } else {
                setUserData(data);
                setUserName(data.userName);
                setLoading(false);
            }
        } catch (e) {
            console.log('error retrieving JSON: ', e);
        }
    }
    const setInitData = async () => {
        try {
            const initJSON = {
                defaultTab: 0,
                userName: 'New User',
                todoItems: [
                    {
                        text: "Use TaSky!",
                        date: (new Date).toISOString(),
                        memo: "Start organizing your tasks using TaSky",
                        completed: "false",
                        pinned: "true"
                    }
                ]
            };
            setUserData(initJSON);
            //dataDomain+'/path/test.json'
            const {data, dataLink } = await mySky.setJSON(dataDomain+'/path/'+userID.toString()+'.json', initJSON);
            setOpenModal(true);
            setLoading(false);
            console.log('SET DATA: ', data);
            console.log('SET DATALINK: ', dataLink);
        } catch (e) {
            console.log('SET ERR: ', e);
        }
    }

    const handleTabChange = (e, i) => {
        setValue(i);
    }

    const updateMySky = async (dataNew, actionString) => {
        //here we update the list of todos with mySky.setJSON()
        let userDataNew = userData;
        userDataNew.todoItems = dataNew;
        setUserData(userDataNew);
        try {
            const {data, dataLink} = await mySky.setJSON(dataDomain+'/path/'+userID.toString()+'.json', userDataNew);
            await contentRecord.recordInteraction({
                skylink: dataLink,
                metadata: { action: actionString },
            });
            console.log('MYSKY result: ', data);
            //console.log('get json',await mySky.getJSON(dataDomain+'/'+userID+'.json'));
        } catch (e) {
            console.log('error: ', e);
        }
    }

    const handleUsernameChange = (event) => {
        setUserName(event.target.value);
    }
    const handleUpdateUsername = async () => {
        let userDataNew = userData;
        userDataNew.userName = userName;
        console.log('USERNAME', userDataNew);
        setUserData(userDataNew);
        setOpenModal(false);
        try {
            const {data, dataLink} = await mySky.setJSON(dataDomain+'/path/'+userID.toString()+'.json', userDataNew);
            await contentRecord.recordInteraction({
                skylink: dataLink,
                metadata: { action: 'updateUsername' },
            });
        } catch (e) {
            console.log('error: ', e);
        }
    }

    return (
        <>
            <IconButton onClick={() => setOpenModal(true)}
                aria-describedby={'simple'}
                edge={'end'}
                aria-label={'left'}>
                <Edit />
            </IconButton>
            <Button onClick={performLogout}>Log Out</Button>
            <Typography align={'center'} component="h1" variant="h5" style={{marginBottom:10}}>
                {!isLoading ? 'Hello, '+userData.userName+'.' : ' '}
            </Typography>

            <div style={{backgroundColor:'gray'}}>
                <AppBar position={'static'}>
                    <Tabs variant={"fullWidth"}
                        value={value} onChange={handleTabChange}>
                        <Tab label={'Day' } />
                        <Tab label={'Week'} />
                        <Tab label={'Month'} />
                        <Tab label={'Year'} />
                    </Tabs>
                </AppBar>
                <TabPanel data={userData.todoItems} updateMySky={updateMySky} value={value} index={0}/>
                <TabPanel data={userData.todoItems} updateMySky={updateMySky} value={value} index={1}/>
                <TabPanel data={userData.todoItems} updateMySky={updateMySky} value={value} index={2}/>
                <TabPanel data={userData.todoItems} updateMySky={updateMySky} value={value} index={3}/>



            </div>
            <Modal open={openModal}
                   className={classes.modal}
            >
                <Container maxWidth={'sm'} style={{height: '100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <Card style={{padding:20}}>
                        <Typography align={'center'} variant={'subtitle2'} style={{marginBottom:10}} >Change you username for Tasky</Typography>
                        <TextField id={'memoEdit'} onChange={handleUsernameChange} fullWidth style={{marginBottom:10}} value={userName}
                                   placeholder={'Enter username...'} variant="outlined" />
                        <Grid container justify={'space-around'}>
                            <Button onClick={() => {
                                setOpenModal(false);
                            }}
                                    variant={'contained'} >Cancel</Button>
                            <Button onClick={handleUpdateUsername} variant={'contained'} color={'primary'}>Save</Button>
                        </Grid>
                    </Card>

                </Container>

            </Modal>
        </>
    )
}
