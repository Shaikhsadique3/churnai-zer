interface RequestParametersTableProps {}

export const RequestParametersTable = ({}: RequestParametersTableProps) => {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Request Parameters</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-2 text-left">Parameter</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Required</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2 font-mono">user_id</td>
              <td className="border border-gray-300 px-4 py-2">string</td>
              <td className="border border-gray-300 px-4 py-2">Yes</td>
              <td className="border border-gray-300 px-4 py-2">Unique identifier for the user</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2 font-mono">plan</td>
              <td className="border border-gray-300 px-4 py-2">string</td>
              <td className="border border-gray-300 px-4 py-2">No</td>
              <td className="border border-gray-300 px-4 py-2">User's subscription plan (Free, Pro, Enterprise)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2 font-mono">usage</td>
              <td className="border border-gray-300 px-4 py-2">integer</td>
              <td className="border border-gray-300 px-4 py-2">No</td>
              <td className="border border-gray-300 px-4 py-2">Usage metric (e.g., API calls, features used)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2 font-mono">last_login</td>
              <td className="border border-gray-300 px-4 py-2">string</td>
              <td className="border border-gray-300 px-4 py-2">No</td>
              <td className="border border-gray-300 px-4 py-2">ISO 8601 timestamp of last login</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};