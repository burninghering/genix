import React from "react";
import styled from "styled-components";

import BannerArea from "./BannerArea";
import DataTable from "./DataTable";
import DataTableBtn from "./DataTabeBtn";

import SystemLog from "./SystemLog";


const Container = styled.div`
    display: flex;
    flex-direction: column;
`


function DataList() {
    return (
        <Container>
            <BannerArea/>
            <DataTable/>
            <DataTableBtn/>
            <SystemLog/>
        </Container>
  );
}

export default DataList;