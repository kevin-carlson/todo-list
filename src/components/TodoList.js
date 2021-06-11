import React, {useState,useEffect} from 'react';
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
    Modal, makeStyles, FormGroup, FormControlLabel, Checkbox, Switch
} from '@material-ui/core';
import 'bootstrap/dist/css/bootstrap.min.css';
import testData from '../resources/testData.json';
import TabPanel from "./TabPanel";
import {Settings} from "@material-ui/icons";
import logo from '../resources/tasky_logo.png';

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
    const { mySky, userID, dataDomain, contentRecord, performLogout, data, currentTheme, changeTheme} = props;
    const [value, setValue] = useState(data.defaultTab);
    const [userData, setUserData] = useState(data);
    const [isLoading, setLoading] = useState(false);
    const classes = useStyles();
    const [openModal, setOpenModal] = useState(userData.userName=='New User');
    const [userName, setUserName] = useState(data.userName);
    const [defaultTab, setDefaultTab] = useState(0);
    const [activeTheme, setActiveTheme] = useState(currentTheme);

    useEffect(() => {
        //here we retrieve json with the users list of to-dos
        console.log('TEST DATA', testData)
        //getInitData();
    },[]);
    useEffect(() => {
        setActiveTheme(props.currentTheme);
    }, [props.currentTheme]);

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
                if(data.defaultTab) {
                    setValue(data.defaultTab);
                    setDefaultTab(data.defaultTab);
                }
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
        if (userData.defaultTab!=defaultTab) {
            userDataNew.defaultTab = defaultTab;
        }
        if (userData.userTheme!=activeTheme.palette.type) {
            userDataNew.userTheme=activeTheme.palette.type;
        }
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
    const handleDefaultTabChange = (i) => {
        setDefaultTab(i);
    }

    return (
        <>
            <Grid container justify={'space-between'}>
                <div style={{display:'flex', alignItems:'center'}}>
                    <img src={logo} style={{height:35, aspectRatio:1, margin:4}}/>
                    <Typography color={'primary'} variant={'h6'}>TaSky</Typography>
                </div>
                <div style={{display:'flex', alignItems:'center'}}>
                    <IconButton style={{marginRight:0}}
                                onClick={() => setOpenModal(true)}
                                aria-describedby={'simple'}
                                edge={'end'}
                                aria-label={'left'}>
                        <Settings />
                    </IconButton>
                    <Button variant={'outlined'} onClick={performLogout}>Log Out</Button>
                </div>

            </Grid>
            <Typography align={'center'} component="h1" variant="h5" style={{marginBottom:10}}>
                {!isLoading ? 'Hello, '+userData.userName+'.' : ' '}
            </Typography>


            <div>
                <AppBar position={'static'}>
                    <Tabs variant={"fullWidth"}
                        value={value} onChange={handleTabChange}>
                        <Tab label={'Day' } style={{ minWidth: 50 }}/>
                        <Tab label={'Week'} style={{ minWidth: 50 }}/>
                        <Tab label={'Month'} style={{ minWidth: 50 }}/>
                        <Tab label={'Year'} style={{ minWidth: 50 }}/>
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
                        <Typography align={'center'} variant={'subtitle2'} style={{marginBottom:10}} >Set Default Tab</Typography>
                        <FormGroup row style={{marginBottom:10}}>
                            <FormControlLabel
                                control={<Checkbox checked={defaultTab==0} onChange={() => handleDefaultTabChange(0)} name="day" />}
                                label="Day"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={defaultTab==1} onChange={() => handleDefaultTabChange(1)} name="week" />}
                                label="Week"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={defaultTab==2} onChange={() => handleDefaultTabChange(2)} name="month" />}
                                label="Month"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={defaultTab==3} onChange={() => handleDefaultTabChange(3)} name="year" />}
                                label="Year"
                            />
                        </FormGroup>
                        <FormGroup row style={{display:'flex', alignItems:'center', justifyContent: 'center'}}>
                            <FormControlLabel control={<Switch checked={activeTheme.palette.type=='dark'} onChange={changeTheme} name="themeSwitch" />}
                                              label={'Dark Mode'} />
                        </FormGroup>
                        <Typography align={'center'} variant={'subtitle2'} style={{marginBottom:10}} >Change you username for TaSky</Typography>
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
