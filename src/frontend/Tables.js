// This will return Tables Component
function Tables (head, rows, totalCount) {
    return (
        <Box>
        <DynamicTable
          head={head}
          rows={rows ? rows : "Loading...."}
          rowsPerPage={10}
        />
        <Text>
          Total issues in this project:{" "}
          <Badge appearance="primary" max={false}>
            {totalCount}
          </Badge>
        </Text>
      </Box>
    );
  }
  export default Tables;