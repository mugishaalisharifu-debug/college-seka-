import 'dotenv/config';

const API = 'http://localhost:5000/api';

async function main() {
  const fd = new FormData();
  fd.append('firstName', 'UploadTest');
  fd.append('lastName', 'Connectivity');
  fd.append('gender', 'Male');
  fd.append('dateOfBirth', '2012-05-05');
  fd.append('educationLevel', 'PRIMARY');
  fd.append('appliedClass', 'Primary 5');
  fd.append('tradeName', '');
  fd.append('previousSchool', 'Test School');
  fd.append('parentName', 'Test Parent');
  fd.append('parentPhone', '0788000788');
  fd.append('parentEmail', 'parent@test.com');
  fd.append('residentialDescription', 'Test address');
  fd.append('relationship', 'Father');

  // Real file upload (matches what the apply form sends).
  fd.append(
    'birthCertificate',
    new Blob(['fake-pdf-content'], { type: 'application/pdf' }),
    'birth-certificate.pdf',
  );
  fd.append(
    'passportPhoto',
    new Blob(['fake-image-content'], { type: 'image/jpeg' }),
    'photo.jpg',
  );

  const res = await fetch(`${API}/applications`, { method: 'POST', body: fd });
  const text = await res.text();
  console.log('Submit status:', res.status);
  console.log('Body:', text.slice(0, 500));
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
