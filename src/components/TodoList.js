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
    const classes = useStyles();
    const [openModal, setOpenModal] = useState(userData.userName=='New User');
    const [userName, setUserName] = useState(data.userName);
    const [defaultTab, setDefaultTab] = useState(0);
    const [activeTheme, setActiveTheme] = useState(currentTheme);


    useEffect(() => {
        setActiveTheme(props.currentTheme);
    }, [props.currentTheme]);

    const handleTabChange = (e, i) => {
        setValue(i);
    }

    /**
     * Used to edit todoItems key of user's JSON
     *
     * @param {array} dataNew Array of updated todoItems
     * @param {string} actionString String describing what was updated, used for contentRecord
     */
    const updateMySky = async (dataNew, actionString) => {
        let userDataNew = userData;
        userDataNew.todoItems = dataNew;
        setUserData({...userDataNew});
        try {
            const {data, dataLink} = await mySky.setJSON(dataDomain+'/path/'+userID.toString()+'.json', userDataNew);
            await contentRecord.recordInteraction({
                skylink: dataLink,
                metadata: { action: actionString },
            });
        } catch (e) {
            console.log('error: ', e);
        }
    }

    const handleUsernameChange = (event) => {
        setUserName(event.target.value);
    }
    /**
     * Saves user metadata to mysky
     * @returns {Promise<void>}
     */
    const handleUpdateMetadata = async () => {
        let userDataNew = userData;
        userDataNew.userName = userName;
        if (userData.defaultTab!=defaultTab) {
            userDataNew.defaultTab = defaultTab;
        }
        if (userData.userTheme!=activeTheme.palette.type) {
            userDataNew.userTheme=activeTheme.palette.type;
        }
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
                {'Hello, '+userData.userName+'.'}
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
                <TabPanel userData={userData.todoItems} updateMySky={updateMySky} value={value} index={0}/>
                <TabPanel userData={userData.todoItems} updateMySky={updateMySky} value={value} index={1}/>
                <TabPanel userData={userData.todoItems} updateMySky={updateMySky} value={value} index={2}/>
                <TabPanel userData={userData.todoItems} updateMySky={updateMySky} value={value} index={3}/>



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
                            <Button onClick={handleUpdateMetadata} variant={'contained'} color={'primary'}>Save</Button>
                        </Grid>
                    </Card>

                </Container>

            </Modal>
        </>
    )
}
