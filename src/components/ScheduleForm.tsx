import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import { BRAND } from "../theme/colors";
import {
  Box, Paper, Typography, Button,
  TextField, Select, MenuItem, FormControl, FormHelperText,
  Table, TableBody, TableContainer, TableHead, TableRow
} from '@mui/material';
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import { SelectChangeEvent } from '@mui/material/Select';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

import type { ScheduleRow } from '../types/getaway';
import { compareTimes } from '../utils/dataMappers';
import { useTranslation } from 'react-i18next';
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

type RowError = {
  date?: string;
  startHour?: string;
  startMinute?: string;
  endHour?: string;
  endMinute?: string;
  activity?: string;
  location?: string;
  endPeriod?: string;
};

type ScheduleFormProps = {
  rows: ScheduleRow[];
  setRows: React.Dispatch<React.SetStateAction<ScheduleRow[]>>;
};

const hourOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
const minuteOptions = ["00", "15", "30", "45"];
const periodOptions = ["AM", "PM"];
const generateId = () => Math.random().toString(36).substr(2, 9);

export function ScheduleForm({ rows, setRows }: ScheduleFormProps) {
  const { t } = useTranslation();
  const [activeForms, setActiveForms] = useState<ScheduleRow[]>([
    {
      id: generateId(),
      date: "",
      startHour: "",
      startMinute: "",
      startPeriod: "AM",
      endHour: "",
      endMinute: "",
      endPeriod: "AM",
      activity: "",
      location: ""
    },
  ]);
  const [localErrors, setLocalErrors] = useState<RowError[]>([{}]);
  const [touched, setTouched] = useState<boolean[]>([false]);

  function validateFormRow(form: ScheduleRow): RowError {
    const error: RowError = {};
    if (!form.date) error.date = t('sched.required');
    if (!form.startHour) error.startHour = t('sched.required');
    if (!form.startMinute) error.startMinute = t('sched.required');
    if (!form.endHour) error.endHour = t('sched.required');
    if (!form.endMinute) error.endMinute = t('sched.required');
    if (
      form.startHour && form.startMinute && form.endHour && form.endMinute &&
      (!compareTimes(form.startHour, form.startMinute, form.startPeriod, form.endHour, form.endMinute, form.endPeriod))
    ) {
      error.endPeriod = t('sched.afterStart');
    }
    if (!form.activity) error.activity = t('sched.required');
    if (!form.location) error.location = t('sched.required');
    return error;
  }

  const handleFormChange = (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setActiveForms((forms) =>
      forms.map((form, i) =>
        i === idx ? { ...form, [name as string]: value as string } : form
      )
    );
    setTouched((prev) => prev.map((t, i) => (i === idx ? true : t)));
  };

  //form row
  const handleNewFormRow = () => {
    setActiveForms((forms) => [
      ...forms,
      {
        id: generateId(),
        date: "",
        startHour: "",
        startMinute: "",
        startPeriod: "AM",
        endHour: "",
        endMinute: "",
        endPeriod: "AM",
        activity: "",
        location: ""
      }
    ]);
    setLocalErrors((errs) => [...errs, {}]);
    setTouched((t) => [...t, false]);
  };

  const handleConfirmFormRow = (idx: number) => {
    const form = activeForms[idx];
    const validation = validateFormRow(form);
    setTouched((prev) => prev.map((t, i) => (i === idx ? true : t)));
    setLocalErrors((errs) => errs.map((e, i) => (i === idx ? validation : e)));

    const hasNoError = Object.keys(validation).length === 0;
    if (hasNoError) {
      console.log("Row toSave:", form);
      setRows((prev) => [...prev, form]);
      setActiveForms((forms) => forms.filter((_, i) => i !== idx));
      setLocalErrors((errs) => errs.filter((_, i) => i !== idx));
      setTouched((t) => t.filter((_, i) => i !== idx));
    }
  };

  const handleRemoveRow = (idToRemove: string) => {
    setRows((rows) => rows.filter((row) => row.id !== idToRemove));
  };

  return (
    <Box>
      <Typography variant="body1" fontWeight="bold" color={BRAND.primary}> {t('sched.schedule')} </Typography>
      <TableContainer component={Paper} elevation={3} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 500 }}>
          <TableHead>
            <StyledTableRow>
              <StyledTableCell sx={{ p:'1 0 1 1', width:'90px', minWidth:'90px',}}> {t('sched.date')} </StyledTableCell>
              <StyledTableCell sx={{ p:'0', pl:1, width: '110px' }}> {t('sched.startTime')} </StyledTableCell>
              <StyledTableCell sx={{ p:'0', minWidth: '50px' }}> {t('sched.endTime')} </StyledTableCell>
              <StyledTableCell sx={{ p:'0', minWidth: '150px'}}> {t('sched.activity')} </StyledTableCell>
              <StyledTableCell sx={{ p:'0', minWidth: '150px' }}> {t('sched.location')} </StyledTableCell>
              <StyledTableCell sx={{ p:'0', width: '10px' }} align="center"></StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {activeForms.map((form, idx) => (
              <StyledTableRow key={form.id}>
                <StyledTableCell sx={{ p:'0 2px 0 10px'}} >
                  <FormControl size="small" error={!!(touched[idx] && localErrors[idx]?.date )}>
                    <TextField 
                      sx={{ width: 157 }}
                      name="date" type="date" size="small" value={form.date || ''}
                      placeholder="DD/MM/YY"
                      onChange={e => handleFormChange(idx, e)}
                      InputLabelProps={{ shrink: true }}
                      error={!!(touched[idx] && localErrors[idx]?.date)}
                    />
                    <FormHelperText>
                      {touched[idx] && localErrors[idx]?.date ? localErrors[idx]?.date : " "}
                    </FormHelperText>
                  </FormControl>
                </StyledTableCell>

                {/* Start time */}
                <StyledTableCell sx={{ padding:'0 5px 0 5px'}} >
                  <Box sx={{ display: 'flex', alignItems: 'start' }}>
                    <FormControl size="small" sx={{ width: 60, minHeight: 60 }} error={!!(touched[idx] && localErrors[idx]?.startHour)}>
                      <Select name="startHour" displayEmpty sx={{ borderRadius: '4px 0 0 4px'}}
                        value={form.startHour}
                        onChange={e => handleFormChange(idx, e)}
                      >
                        <MenuItem value="">{t('sched.hr')}</MenuItem>
                        {hourOptions.map(hr => (
                          <MenuItem key={hr} value={hr}>{hr}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ maxWidth:70, minHeight:60 }}
                      error={!!(touched[idx] && localErrors[idx]?.startMinute)}>
                      <Select name="startMinute" displayEmpty sx={{ borderRadius:'0px'}}
                        value={form.startMinute}
                        onChange={e => handleFormChange(idx, e)}
                      >
                        <MenuItem value="">{t('sched.min')}</MenuItem>
                        {minuteOptions.map(min => (
                          <MenuItem key={min} value={min}>{min}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minHeight:60 }}>
                      <Select name="startPeriod" sx={{ width:'68px', pl:0, borderRadius:'0px 4px 4px 0' }}
                        value={form.startPeriod}
                        onChange={e => handleFormChange(idx, e)}
                      >
                        {periodOptions.map(p => (
                          <MenuItem key={p} value={p}>{p}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <FormHelperText sx={{ color:"#df1010ff", lineHeight:'0.1px', display:'block'}}>
                    {touched[idx] && (localErrors[idx]?.startHour || localErrors[idx]?.startMinute)
                      ? (localErrors[idx]?.startHour || localErrors[idx]?.startMinute)
                      : " "
                      }
                  </FormHelperText>
                </StyledTableCell>

                {/* End time */}
                <StyledTableCell sx={{ pl:'0', pr:'1px'}}>
                  <Box sx={{ display: 'flex', alignItems: 'start' }}>
                    <FormControl size="small" sx={{ width: 60, minHeight: 60 }}
                      error={!!(touched[idx] && localErrors[idx]?.endHour)}
                      >
                      <Select name="endHour" displayEmpty sx={{ borderRadius: '4px 0 0 4px'}}
                        value={form.endHour}
                        onChange={e => handleFormChange(idx, e)}
                      >
                        <MenuItem value="">{t('sched.hr')}</MenuItem>
                        {hourOptions.map(hr => (
                          <MenuItem key={hr} value={hr}>{hr}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ maxWidth:70, minHeight:60, p:0 }}
                      error={!!(touched[idx] && localErrors[idx]?.endMinute)}
                      >
                      <Select name="endMinute" displayEmpty sx={{ borderRadius:'0px' }}
                        value={form.endMinute}
                        onChange={e => handleFormChange(idx, e)}
                      >
                        <MenuItem value="">{t('sched.min')}</MenuItem>
                        {minuteOptions.map(min => (
                          <MenuItem key={min} value={min}>{min}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ width: 68, minHeight: 60 }}
                      error={!!(touched[idx] && localErrors[idx]?.endPeriod)}
                      >
                      <Select name="endPeriod" sx={{ width:'68px', pl:0, p:0, borderRadius: '0px 4px 4px 0'}}
                        value={form.endPeriod}
                        onChange={e => handleFormChange(idx, e)}
                      >
                        {periodOptions.map(p => (
                          <MenuItem key={p} value={p}>{p}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <FormHelperText sx={{ color:"#df1010ff", lineHeight:'0.1px', display:'block', p:0, }}>
                    {touched[idx] && localErrors[idx]?.endPeriod ? localErrors[idx]?.endPeriod : " "}
                  </FormHelperText>
                </StyledTableCell>
                <StyledTableCell sx={{ p:'0 3px 0 0' }}>
                  <TextField size="small" fullWidth sx={{ width:'160px'}}
                    name="activity" placeholder={t('sched.activityTitle')}
                    value={form.activity}
                    onChange={e => handleFormChange(idx, e)}
                    error={!!(touched[idx] && localErrors[idx]?.activity)}
                    helperText={touched[idx] && localErrors[idx]?.activity ? localErrors[idx]?.activity : " "}
                  />
                </StyledTableCell>
                <StyledTableCell sx={{ width:'150px', pl:0}}>
                  <TextField size="small" fullWidth sx={{ width:'160px', padding:'0 1px 0 0'}}
                    name="location" placeholder={t('sched.location')}
                    value={form.location}
                    onChange={e => handleFormChange(idx, e)}
                    error={!!(touched[idx] && localErrors[idx]?.location)}
                    helperText={touched[idx] && localErrors[idx]?.location ? localErrors[idx]?.location : " "}
                  />
                </StyledTableCell>
                <StyledTableCell sx={{ pl:'0' }} align="center">
                  <Button variant="contained" color="primary" size="small" aria-label="save"
                    sx={{ borderRadius:'20px', textTransform:'none', fontWeight:'bold', bgcolor: BRAND.primary,  color: BRAND.white, ':hover': { color: BRAND.primary, bgcolor: BRAND.white}}}
                    onClick={() => handleConfirmFormRow(idx)}
                  > {t('sched.save')} </Button>
                  {/* <IconButton onClick={() => handleRemoveFormRow(idx)} aria-label="delete"> */}
                  {/* <IconButton onClick={() => handleRemoveRow(idx)} aria-label="delete">
                    <DeleteIcon/>
                  </IconButton> */}
                </StyledTableCell>
              </StyledTableRow>
            ))}
            {rows.map((row) => (
              <TableRow key={`saved-${row.id}`}>
                <StyledTableCell>{row.date}</StyledTableCell>
                <StyledTableCell>
                  {row.startHour}:{row.startMinute} {row.startPeriod}
                </StyledTableCell>
                <StyledTableCell>
                  {row.endHour}:{row.endMinute} {row.endPeriod}
                </StyledTableCell>
                <StyledTableCell>{row.activity}</StyledTableCell>
                <StyledTableCell>{row.location}</StyledTableCell>
                <StyledTableCell align="center" sx={{ p:0.6 }}>
                  <IconButton onClick={() => handleRemoveRow(row.id as string)} aria-label="delete activity"><DeleteIcon/></IconButton>
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display:"flex", gap:2, mt:1 }}>
        <Button startIcon={<AddIcon />} variant="outlined" disableElevation
          onClick={handleNewFormRow}
          sx={{
            color:BRAND.navy, bgcolor:BRAND.green, borderRadius:'30px', fontWeight:'bold', textTransform:'none',
            ':hover': { bgcolor:BRAND.primary, color:'white' }
          }}
        > {t('sched.addActivity')} </Button>
      </Box>
    </Box>
  );
}