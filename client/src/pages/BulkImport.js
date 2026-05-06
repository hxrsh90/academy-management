import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const BulkImport = () => {
  const [jsonData, setJsonData] = useState('');
  const [defaultPassword, setDefaultPassword] = useState('student123');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let students;
      try {
        students = JSON.parse(jsonData);
      } catch (e) {
        setError('Invalid JSON format. Please check your data.');
        setLoading(false);
        return;
      }

      if (!Array.isArray(students)) {
        setError('Data must be an array of student objects');
        setLoading(false);
        return;
      }

      const response = await api.post('/import/students', {
        students,
        defaultPassword
      });

      setResult(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    const sample = [
      {
        "name": "Shan",
        "mobile": "9999000001",
        "SPOC": "BK",
        "Plan": "5 days A week",
        "Sports": "Munchkin",
        "Date of Joining": "01/04/26",
        "Date of Payment": "13/04/26",
        "Additional Days": "",
        "Last Day of Membership": "Friday, 1 May 2026",
        "Registration Fees": "3,000",
        "Discount on Registration": "3,000",
        "Membership Amount": "11,500",
        "Discount on Membership": "",
        "Sibling/Referral Discount": "",
        "Total": "11,500",
        "Membership Paid": "4,000",
        "Pending": "7,500",
        "Pending Amt to be paid on": "01-May-26",
        "Remarks": ""
      }
    ];
    setJsonData(JSON.stringify(sample, null, 2));
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/students" className="text-blue-600 hover:underline">
          <i className="fas fa-arrow-left mr-2"></i>Back to Students
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Bulk Import Students</h1>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="font-bold text-yellow-800 mb-2">Import Instructions</h3>
        <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
          <li>Paste JSON array of student objects below</li>
          <li>Each student should have at minimum: name, and optionally mobile</li>
          <li>If mobile is not provided, it will be auto-generated</li>
          <li>Default password will be set for all new users</li>
          <li>Dates should be in DD/MM/YY or DD/MM/YYYY format</li>
          <li>Amounts can include currency symbols (₹) and commas</li>
          <li>If student already exists by mobile, their data will be updated</li>
        </ul>
        <button 
          onClick={generateSampleData}
          className="mt-3 text-sm text-blue-600 hover:underline"
        >
          Load Sample Data
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">Default Password for New Users</label>
            <input
              type="text"
              value={defaultPassword}
              onChange={(e) => setDefaultPassword(e.target.value)}
              className="w-full max-w-md px-3 py-2 border rounded"
              minLength="6"
            />
            <p className="text-xs text-gray-500 mt-1">All new students will login with mobile + this password</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">Student Data (JSON Array)</label>
            <textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              className="w-full h-96 px-3 py-2 border rounded font-mono text-sm"
              placeholder='[{"name":"John Doe","mobile":"9999000001","SPOC":"BK","Plan":"5 days A week","Sports":"Football"}]'
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                  Importing...
                </span>
              ) : 'Import Students'}
            </button>
            <button
              type="button"
              onClick={() => { setJsonData(''); setResult(null); setError(null); }}
              className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-red-800">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Import Results</h2>
          
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-2xl font-bold text-blue-600">{result.total}</div>
              <div className="text-sm text-blue-800">Total Rows</div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="text-2xl font-bold text-green-600">{result.successful}</div>
              <div className="text-sm text-green-800">Successful</div>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <div className="text-2xl font-bold text-red-600">{result.failed}</div>
              <div className="text-sm text-red-800">Failed</div>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-sm font-mono text-gray-600 truncate">{result.batchId}</div>
              <div className="text-sm text-gray-800">Batch ID</div>
            </div>
          </div>

          {result.created && result.created.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold mb-2">Created/Updated Students ({result.created.length})</h3>
              <div className="bg-gray-50 rounded p-4 max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-2">#</th>
                      <th className="pb-2">Name</th>
                      <th className="pb-2">Mobile</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.created.map((student, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="py-1">{student.index + 1}</td>
                        <td className="py-1">{student.name}</td>
                        <td className="py-1 font-mono">{student.mobile}</td>
                        <td className="py-1">
                          <span className={`px-2 py-1 rounded text-xs ${
                            student.status === 'created' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result.errors && result.errors.length > 0 && (
            <div>
              <h3 className="font-bold mb-2 text-red-600">Errors ({result.errors.length})</h3>
              <div className="bg-red-50 rounded p-4 max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-2">#</th>
                      <th className="pb-2">Name</th>
                      <th className="pb-2">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((err, idx) => (
                      <tr key={idx} className="border-t border-red-100">
                        <td className="py-1">{err.index + 1}</td>
                        <td className="py-1">{err.name}</td>
                        <td className="py-1 text-red-600">{err.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkImport;
