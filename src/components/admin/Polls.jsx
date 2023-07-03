import React, { useEffect, useState } from "react";
import { ViewPolls } from "../user/ViewPolls";
import { ACTIVE_POLLS_URL, allPollsUrl } from "../../constants";
import axios from "axios";
import { auth } from "../features/User.reducer";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { LoadingContainer } from "../Styles";

export const Polls = () => {
  const user = useSelector(auth);
  const [pollsData, setPollsData] = useState([]);
  const [resetPolls, setResetPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const activeFlag = false;
  const [selectedTab, setSelectedTab] = useState("Active");
  const [activePolls, setActivePolls] = useState([]);
  const [endedPolls, setEndedPolls] = useState([]);
  const [upcomingPolls, setUpcomingPolls] = useState([]);
  const [focus, setFocus] = useState(false);

  const handleSelectedTab = (e, value) => {
    setSelectedTab(value);
  };
  useEffect(() => {
    selectedTab === "Active"
      ? setPollsData([...activePolls])
      : selectedTab === "Ended"
      ? setPollsData([...endedPolls])
      : setPollsData([...upcomingPolls]);
  }, [selectedTab]);

  const navigate = useNavigate();
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    if (value === "") {
      setPollsData([...resetPolls]);

      return;
    }

    const updatedPollsData = resetPolls.filter((cur) =>
      cur.title.toLowerCase().includes(value.trim())
    );
    setPollsData(updatedPollsData);
  };
  const managePolls = (data) => {
    const active = [];
    const ended = [];
    const upcoming = [];
    const currentDate = new Date().setHours(0, 0, 0, 0);
    data.forEach((cur) => {
      const startDate = new Date(cur.start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(cur.end_date).setHours(0, 0, 0, 0);
      if (startDate <= currentDate && endDate >= currentDate) {
        active.push(cur);
      } else if (startDate > currentDate) {
        upcoming.push(cur);
      } else {
        ended.push(cur);
      }
    });
    setActivePolls(active);
    setUpcomingPolls(upcoming);
    setEndedPolls(ended);
    setPollsData(active);
  };

  const fetchPolls = async () => {
    try {
      const token = user.token;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.get(allPollsUrl, config);
      if (response.status === 200) {
        setResetPolls(response.data.data);
        managePolls(response.data.data);

        setLoading(false);
      }
    } catch (err) {
      localStorage.clear();
      navigate("/login");
    }
  };
  useEffect(() => {
    fetchPolls();
    setSearch("");
  }, []);
  useEffect(() => {
    focus === false ? setSelectedTab("Active") : setPollsData(resetPolls);
  }, [focus]);
  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress />
        <Typography variant="subtitle">Loading</Typography>
      </LoadingContainer>
    );
  }

  return (
    <>
      <Stack
        direction={"row"}
        justifyContent={"space-between"}
        marginRight={2}
        marginLeft={2}
      >
        <Box>
          <TextField
            placeholder="Enter the keywords"
            label="Search Poll"
            size="small"
            onChange={handleSearch}
            value={search}
            onFocus={() => {
              setFocus(true);
            }}
          ></TextField>
        </Box>
        <Box flex={1} onClick={() => setFocus(false)}></Box>

        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate("/admin/create")}
        >
          Create Poll
        </Button>
      </Stack>
      {!focus && !search.length > 0 && (
        <Box>
          <Tabs value={selectedTab} onChange={handleSelectedTab}>
            <Tab value="Active" label="Active Polls"></Tab>
            <Tab value="Ended" label="Ended Polls"></Tab>
            <Tab value="Upcoming" label="Upcoming Polls"></Tab>
          </Tabs>
        </Box>
      )}
      <ViewPolls activeFlag={activeFlag} pollsData={pollsData} />;
    </>
  );
};
