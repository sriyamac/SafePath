import React from 'react';
import { Typography, Container, Box } from '@mui/material';

const AboutUs = () => {
  return (
    <Container maxWidth="md" style={{ marginTop: '100px' }}>
      <Box style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
        <Typography variant="h4" gutterBottom>
          About SafeSpot
        </Typography>
        <Typography variant="body1" paragraph>
          SafeSpot is an innovative platform that helps users stay informed about disasters in their area.
          Our mission is to provide real-time alerts, safety tips, and recommendations to keep communities safe.
          We believe in the power of technology to make a difference and aim to bring cutting-edge solutions
          for personal safety and disaster preparedness.
        </Typography>
        <Typography variant="body1" paragraph>
          Our team consists of dedicated professionals from various fields, including software development,
          safety experts, and data analysts. Together, we work to ensure that SafeSpot provides the most accurate
          and timely information to our users.
        </Typography>
        <Typography variant="body1">
          Join us on our mission to make the world a safer place, one alert at a time.
        </Typography>
      </Box>
    </Container>
  );
};

export default AboutUs;
