import React, {useState,useEffect} from 'react';
import { Typography, Container, Button, List, ListItem, ListItemIcon, Menu, MenuItem, Modal, Card,
    Checkbox, ListItemText, ListItemSecondaryAction, IconButton, TextField, makeStyles, CircularProgress,
    Grid, FormControlLabel } from '@material-ui/core';
import {
    MuiPickersUtilsProvider,
    KeyboardTimePicker,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { MoreHoriz, LabelImportant, Note, Delete, ChevronLeft, ChevronRight } from '@material-ui/icons';


import 'bootstrap/dist/css/bootstrap.min.css';

let currentDate = new Date();
let weekDate = new Date();
weekDate.setDate(currentDate.getDate()+6);
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
//const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            padding:theme.spacing(1),
            width: '100%',
        },
        paper: {
            border: '1px solid',
            padding: theme.spacing(1),
            backgroundColor: theme.palette.background.paper,
        },
        modal: {
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
        },
        modalCard: {
            alignItems:'center'
        },
        progress: {
            display: 'flex',
            '& > * + *': {
                marginLeft: theme.spacing(2),
            },
        },
    },
    container: {
        backgroundColor: theme.palette.background.paper
    }
}));

export default function TabPanel (props) {
    //index 0=day view, 1=week, 2=month, 3=year
    const {value, index, updateMySky} = props;
    const [data, setData] = useState(props.data);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const classes = useStyles();
    const [popAnchor,setPopAnchor] = useState(null);
    const [menuIndex, setMenuIndex] = useState(0);
    const [isLoading, setLoading] = useState(true);
    const [noTodo, setNoTodo] = useState(false);

    //create new task states
    const [taskDate, setTaskDate] = useState(new Date());
    const [taskMemo, setTaskMemo] = useState();
    const [taskText, setTaskText] = useState();
    const [isOngoing, setOngoing] = useState(false);
    const [pinNew, setPinNew] = useState(false);

    //add,edit memo modal
    const [openModal, setOpenModal] = useState(false);

    //date displays
    const [dateString, setDateString] = useState(currentDate.toLocaleDateString(undefined, options).split(', ', 3));
    const [displayMonth, setDisplayMonth] = useState(months[currentDate.getMonth()]);

    useEffect(() => {
        setData(props.data);
        if (props.data[0]!=null) {
            if (props.data[0].pinned!=null){
                setLoading(false);
                setNoTodo(false);
            }
        } else {
            setNoTodo(true);
        }


    },[props.data]);

    useEffect(()=> {
        setShowAdvanced(false);
        setTaskMemo(null);
        setTaskText(null);
        currentDate = new Date();
        //if week tab selected
        if (value == 1) {
            currentDate.setHours(0,0,0);
        }
        setDateString(currentDate.toLocaleDateString(undefined, options).split(', ', 3));
        weekDate.setDate(currentDate.getDate()+6);
    }, [value]);

    /**
     * Check if should display task based on date
     * @param {string} d ISO date string of the task
     * @returns {boolean}
     */
    const checkDate = (d) => {
        const displayDate = currentDate.toLocaleDateString(undefined, options);
        const dateArr = displayDate.split(', ', 3);
        const d1 = new Date(d);
        const taskDateArr = d1.toLocaleDateString(undefined, options).split(', ', 3);
        if (index==0) {
            //we are on the daily view
            if (dateArr[0]==taskDateArr[0] && dateArr[1]==taskDateArr[1] && dateArr[2]==taskDateArr[2]) {
                return true;
            }
        } else if (index==1) {
            //weekly view < 604800000ms
            if (d1.getTime()-currentDate.getTime()>0 && d1.getTime()-currentDate.getTime() < 604800000) {
                return true;
            }

        } else if (index==2) {
            //month view
            if (d1.getMonth()==currentDate.getMonth()){
                return true;
            }
        } else {
            //year view
            if (dateArr[2]==taskDateArr[2]) {
                return true;
            }
        }
        //return true;

    }

    const handleDateChange = (date) => {
        setTaskDate(date);
    }
    const handleTimeChange = () => {

    }
    const handleTextFocus = () => {
        setShowAdvanced(true);
    }
    const handleNewTextChange = (event) => {
        setTaskText(event.target.value);
    }
    const handleNewMemoChange = (event) => {
        setTaskMemo(event.target.value);
    }

    const handleCreateNewTask = () => {
        if (taskText!='' || taskText!=null){
            setShowAdvanced(false);
            //new task json
            const taskJSON = {
                text: taskText,
                memo: taskMemo,
                date: taskDate.toISOString(),
                pinned: pinNew,
                ongoing: isOngoing,
                completed: false
            }
            //insert to top of to do list
            let dataNew = [taskJSON].concat(data);
            setData(dataNew);
            setNoTodo(false);
            setLoading(false);
            //reset the form
            setTaskText(null);
            setTaskMemo(null);
            setTaskDate(new Date());
            document.getElementById('new-task-form'+index.toString()).reset();

            //update with mySky
            updateMySky(dataNew, 'addTodoItem');
        }

    }
    const handleDeleteTask = (index) => {
        let dataNew = data;
        dataNew.splice(index, 1);
        setMenuIndex(0);
        if (dataNew.length == 0) {
            setNoTodo(true);
            setLoading(true);
        }
        setData(dataNew);
        setPopAnchor(null);
        updateMySky(dataNew, 'deleteTodoItem');
    }

    const handlePinTask = (index) => {
        let dataNew = data;
        dataNew[index].pinned = !data[index].pinned;
        setData([...dataNew]);
        setPopAnchor(null);
        updateMySky(dataNew, 'pinnedTodoItem');
    }

    const handleCompleteTask = (index) => {
        let dataNew = data;
        dataNew[index].completed = !data[index].completed;
        setData([...dataNew]);
        updateMySky(dataNew, 'completedTodoItem');
    }

    const handleAddMemoTextChange = (event) => {
        setTaskMemo(event.target.value);
    }
    const handleAddMemo = () => {
        let dataNew = data;
        dataNew[menuIndex].memo = taskMemo;
        setData([...dataNew]);
        setOpenModal(false);
        setTaskMemo(null);
        updateMySky(dataNew, 'add/editMemoToExisting');
    }

    const handleDateDecrement = () => {
        if (index==0) {
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (index==1) {
            currentDate.setDate(currentDate.getDate() - 7);
            weekDate.setDate(currentDate.getDate() + 6);
        } else if (index==2) {
            currentDate.setMonth(currentDate.getMonth() - 1);
            setDisplayMonth(months[currentDate.getMonth()]);
        } else {
            currentDate.setFullYear(currentDate.getFullYear() - 1);
        }
        setDateString(currentDate.toLocaleDateString(undefined, options).split(', ', 3));
    }
    const handleDateIncrement = () => {
        if (index==0) {
            currentDate.setDate(currentDate.getDate() + 1);
        } else if (index==1) {
            //week view
            currentDate.setDate(currentDate.getDate() + 7);
            weekDate.setDate(currentDate.getDate() + 6);
        } else if (index==2) {
            currentDate.setMonth(currentDate.getMonth() + 1);
            setDisplayMonth(months[currentDate.getMonth()]);
        } else {
            currentDate.setFullYear(currentDate.getFullYear() + 1);
        }
        setDateString(currentDate.toLocaleDateString(undefined, options).split(', ', 3));
    }

    return (
        <Container className={classes.container} hidden={value != index} style={{marginTop:2}}>
            <Grid container justify={'space-around'}>
                    <IconButton onClick={handleDateDecrement}
                            aria-describedby={'simple'}
                            edge={'end'}
                            aria-label={'left'}>
                    <ChevronLeft />
                </IconButton>
                {index==0 ? (
                    <div>
                        <Typography align={'center'} variant={'h5'} >{dateString[0]}</Typography>
                        <Typography align={'center'} variant={'subtitle1'} >{dateString[1]+', '+dateString[2]}</Typography>
                    </div>
                ):index==1 ? (
                    <div>
                        <Typography align={'center'} variant={'h5'} >{dateString[0]}</Typography>
                        <Typography align={'center'} variant={'subtitle1'} >{dateString[1]+' - ' +
                        (currentDate.getMonth()!=weekDate.getMonth() ? months[weekDate.getMonth()]+' ' : '') + weekDate.getDate()}</Typography>
                    </div>
                ):index==2 ? (
                    <div>
                        <Typography align={'center'} variant={'h5'} >{displayMonth}</Typography>
                        <Typography align={'center'} variant={'subtitle1'} >{dateString[2]}</Typography>
                    </div>
                ):(
                    <div style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                        <Typography align={'center'} variant={'h5'} >{dateString[2]}</Typography>
                    </div>
                )}

                <IconButton onClick={handleDateIncrement}
                            aria-describedby={'simple'}
                            edge={'end'}
                            aria-label={'right'}>
                    <ChevronRight />
                </IconButton>
            </Grid>


            <form id={'new-task-form'+index.toString()} className={classes.root} noValidate autoComplete="off">
                <TextField id={"outlined-basic"+index.toString()} onFocus={handleTextFocus} onChange={handleNewTextChange}
                        placeholder="Add a task..." variant="outlined" />
                {showAdvanced ? (
                    <>
                        <TextField id="memo-field"
                                   onChange={handleNewMemoChange}
                                   placeholder="Add a memo..."
                                   variant="outlined" />
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <Grid container justify={'space-around'}>
                                <KeyboardDatePicker
                                    disableToolbar
                                    variant="inline"
                                    format="MM/dd/yyyy"
                                    margin="normal"
                                    id="date-picker"
                                    label="Date"
                                    value={taskDate}
                                    onChange={handleDateChange}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                    }}
                                />
                                <KeyboardTimePicker
                                    margin="normal"
                                    id="time-picker"
                                    label="Time"
                                    value={taskDate}
                                    onChange={handleTimeChange}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change time',
                                    }}
                                />
                        </Grid>
                        </MuiPickersUtilsProvider>
                        <Typography align={'center'} variant={"subtitle2"}>OR</Typography>
                        <FormControlLabel
                            style={{display:'flex', alignItems:'center', justifyContent:'center'}}
                            control={
                                <Checkbox
                                    checked={isOngoing}
                                    onChange={(event) => {
                                        setOngoing(event.target.checked);
                                    }}
                                    name="ongoingCheck"
                                    color="primary"
                                />
                            }
                            label="Ongoing Task"
                        />
                        <Grid container justify={'space-around'}>
                            <Button onClick={() => {
                                setShowAdvanced(false);
                                setTaskText(null);
                                setTaskMemo(null);
                                document.getElementById('new-task-form'+index.toString()).reset();
                            }}
                                variant={'contained'} >Cancel</Button>
                            <Button onClick={handleCreateNewTask} variant={'contained'} color={'primary'}>Save</Button>
                        </Grid>
                    </>
                ):null}
            </form>
            {!isLoading && !noTodo ? (
                <List >
                    {data.map((item, index) => {
                        if ((checkDate(item.date) || item.ongoing) && item.pinned){
                            return (
                                <ListItem key={index.toString()}>
                                    <ListItemIcon>
                                        <Checkbox edge={'start'}
                                                  checked={item.completed}
                                                  onChange={() => handleCompleteTask(index)}
                                                  disableRipple
                                        />
                                        <LabelImportant fontSize="small" />
                                    </ListItemIcon>

                                    <ListItemText primary={item.text} secondary={item.memo}/>
                                    <ListItemSecondaryAction>
                                        <IconButton onClick={(event) => {
                                            setPopAnchor(popAnchor ? null : event.currentTarget);
                                            setMenuIndex(index);
                                        }}
                                                    aria-describedby={'simple'}
                                                    edge={'end'}
                                                    aria-label={'options'}>
                                            <MoreHoriz />
                                        </IconButton>

                                    </ListItemSecondaryAction>
                                </ListItem>
                            )
                        } else {
                            return null;
                        }
                    })}
                    {data.map((item, index) => {
                        if ((checkDate(item.date) || item.ongoing) && !item.pinned){
                            return (
                                <ListItem key={index.toString()}>
                                    <ListItemIcon>
                                        <Checkbox edge={'start'}
                                                  checked={item.completed}
                                                  onChange={() => handleCompleteTask(index)}
                                                  disableRipple
                                        />
                                    </ListItemIcon>
                                    <ListItemText primary={item.text} secondary={item.memo}/>

                                    <ListItemSecondaryAction>
                                        <IconButton onClick={(event) => {
                                            setPopAnchor(popAnchor ? null : event.currentTarget);
                                            setMenuIndex(index);
                                        }}
                                                    aria-describedby={'simple'}
                                                    edge={'end'}
                                                    aria-label={'options'}>
                                            <MoreHoriz />
                                        </IconButton>

                                    </ListItemSecondaryAction>
                                </ListItem>
                            )
                        } else {
                            return null;
                        }
                    })}
                </List>

            ):noTodo ? (
                <Typography align={'center'} variant={'subtitle1'} style={{padding:20}} >No tasks to show!</Typography>
            ) : (
                <div style={{display:'flex', alignContent:'center', justifyContent:'center'}}>
                    <CircularProgress/>
                </div>
            )}
            {!isLoading && !noTodo ? (
                <Menu
                    id="simple-menu"
                    anchorEl={popAnchor}
                    keepMounted
                    open={Boolean(popAnchor)}
                    onClose={() => setPopAnchor(null)}
                >
                    <MenuItem onClick={() => handlePinTask(menuIndex)}>
                        <ListItemIcon>
                            <LabelImportant fontSize="small" />
                        </ListItemIcon>
                        {data[menuIndex].pinned ? 'Unpin task' : 'Pin to top'}
                    </MenuItem>
                    <MenuItem onClick={() => {
                        setOpenModal(true);
                        if (data[menuIndex].memo!=null || data[menuIndex].memo!='') {
                            setTaskMemo(data[menuIndex].memo);
                        } else {
                            setTaskMemo(undefined);
                        }
                        setPopAnchor(null);
                    }}>
                        <ListItemIcon>
                            <Note fontSize="small" />
                        </ListItemIcon>
                        {data[menuIndex].memo==null || data[menuIndex].memo=='' ? 'Add a memo' : 'Edit memo'}
                    </MenuItem>
                    <MenuItem onClick={() => handleDeleteTask(menuIndex)}>
                        <ListItemIcon>
                            <Delete fontSize="small" />
                        </ListItemIcon>
                        Delete
                    </MenuItem>
                </Menu>
            ):null}
            {!isLoading && !noTodo ? (
                <Modal open={openModal}
                       className={classes.modal}
                >
                    <Container maxWidth={'sm'} style={{height: '100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
                        <Card style={{padding:20}}>
                            <Typography align={'center'} variant={'subtitle2'} style={{marginBottom:10}} >Enter your memo for {data[menuIndex].text}.</Typography>
                            <TextField id={'memoEdit'} onChange={handleAddMemoTextChange} fullWidth style={{marginBottom:10}} value={taskMemo}
                                       placeholder={'Add a memo...'} variant="outlined" />
                            <Grid container justify={'space-around'}>
                                <Button onClick={() => {
                                    setOpenModal(false);
                                }}
                                        variant={'contained'} >Cancel</Button>
                                <Button onClick={handleAddMemo} variant={'contained'} color={'primary'}>Save</Button>
                            </Grid>
                        </Card>

                    </Container>

                </Modal>
            ):null}


        </Container>

    )
}
