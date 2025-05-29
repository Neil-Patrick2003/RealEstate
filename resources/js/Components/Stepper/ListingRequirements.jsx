import * as React from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import MobileStepper from '@mui/material/MobileStepper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { Link } from '@inertiajs/react';

const steps = [
  {
    label: 'Welcome to MJVI Realty',
    description: `Thank you for choosing MJVI Realty. Before listing your property, ensure all required documents are available. This helps us verify your listing efficiently and maintain service quality.`,
  },
  {
    label: 'Required Documentation',
    description: `📄 Please ensure you have the following documents ready:\n\n✅ Land Title or Deed of Sale\n✅ A Valid Government-Issued ID\n✅ Latest Tax Declaration or Official Tax Receipt\n✅ Barangay Clearance\n✅ Any additional permits relevant to your property`,
  },
  {
    label: 'Important Reminder',
    description: `All submissions undergo verification by our agents. Incomplete documentation may delay or prevent your property from being listed. Kindly review your materials before proceeding.`,
  },
  {
    label: 'You’re Ready to List!',
    description: `Once you’ve gathered all the required documents, proceed to submit your property details. One of our agents will contact you shortly for final verification. We’re excited to work with you!`,
  },
];

export default function ListingRequirements({ closeModal }) {
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const [countdown, setCountdown] = React.useState(5);
  const maxSteps = steps.length;

  React.useEffect(() => {
    setCountdown(5);
    if (activeStep === maxSteps) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeStep, maxSteps]);

  const handleNext = () => {
    if (activeStep < maxSteps - 1) setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep((prev) => prev - 1);
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        px: { xs: 2, sm: 4 },
        py: { xs: 2, sm: 3 },
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Typography
        variant="h5"
        component="h1"
        sx={{
          fontWeight: 700,
          color: 'primary.main',
          mb: 1,
          textAlign: 'center',
        }}
      >
        {steps[activeStep].label}
      </Typography>

      {/* Divider */}
      <Box
        sx={{
          height: 3,
          width: 60,
          mx: 'auto',
          bgcolor: 'primary.main',
          borderRadius: 10,
          mb: 2,
        }}
      />

      {/* Description */}
      <Box
        sx={{
          flexGrow: 1,
          px: { xs: 0, sm: 1 },
          py: 1,
          overflowY: 'auto',
          fontSize: '1rem',
          textAlign: 'justify', // ✅ add this line

          color: 'text.secondary',
          lineHeight: 1.8,
        }}
      >
        <Typography
          variant="body1"
          sx={{ whiteSpace: 'pre-line', fontSize: '1rem' }}
        >
          {steps[activeStep].description}
        </Typography>
      </Box>

      {/* Stepper & Buttons */}
      <MobileStepper
        variant="dots"
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        sx={{
          justifyContent: 'space-between',
          mt: 3,
          px: 0,
          bgcolor: 'transparent',
        }}
        nextButton={
          activeStep === maxSteps - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={closeModal}
              sx={{ fontWeight: 600, textTransform: 'none' }}
            >
              Continue
            </Button>
          ) : (
            <Button
              size="small"
              onClick={handleNext}
              disabled={countdown > 0}
              endIcon={
                theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />
              }
              sx={{ fontWeight: 600, textTransform: 'none' }}
            >
              {countdown > 0 ? `Next (${countdown})` : 'Next'}
            </Button>
          )
        }
        backButton={
          activeStep === 0 ? (
            <Link
              href={'/'}
              className='text-red-600 text-sm font-semibold'
            >
              Exit
            </Link>
          ) : (
            <Button
              size="small"
              onClick={handleBack}
              startIcon={
                theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />
              }
              sx={{ fontWeight: 500, textTransform: 'none' }}
            >
              Back
            </Button>
          )
        }
      />
    </Box>
  );
}
