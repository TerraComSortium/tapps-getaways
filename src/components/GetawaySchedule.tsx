import * as React from 'react';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Typography, Stack } from '@mui/material';
import { BRAND } from '../theme/colors';
import '../App.css'; 

interface ScheduleItem {
  day: string;
  startTime: string;
  endTime: string;
  activity: string;
  location: string;
}
interface GetawayScheduleProps {
  schedule?: ScheduleItem[];
}
interface Column {
  id: 'day' | 'activity' | 'location';
  label: string;
  minWidth?: number;
  align?: 'right';
  // format?: (value: number) => string;
}
const columns: readonly Column[] = [
  { id: 'day',      label: 'Day',      minWidth: 70 },
  { id: 'activity', label: 'Activity', minWidth: 140 },
  { id: 'location', label: 'Location', minWidth: 140 },
];

export default function GetawaySchedule({ schedule }: GetawayScheduleProps) {
  const hasSchedule = schedule && schedule.length > 0;
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 'none' }}>
      <TableContainer sx={{ maxHeight: 430 }}>
        <Table stickyHeader aria-label="Weekend schedule" >
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell 
                sx={{ maxHeight:10 }}
                key={column.id} align={column.align} style={{ minWidth: column.minWidth }}
                >
                  <Typography variant="body2" 
                  className='title4' 
                  color="text.primary"
                  sx={{ fontWeight: 'bold'}}
                  >{column.label}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {hasSchedule ? (
              schedule.map((item, index) => (
                <TableRow hover tabIndex={-1} key={index}>
                  <TableCell>
                    <Stack direction="column" spacing={0.2}>
                      <strong>{item.date}</strong>
                      <Typography variant="subtitle2" color="text.secondary">
                        {item.startTime} - {item.endTime}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{item.activity}</TableCell>
                  <TableCell>{item.location}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography sx={{ fontStyle: 'italic', color: 'text.secondary', py: 2 }}>
                    The schedule is not currently available
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}