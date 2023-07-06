import Formfield from "../components/FormField"
import { Form, Formik } from "formik"
import * as yup from "yup"
import axios from "axios"
import { useState } from "react"
import { Doughnut } from "react-chartjs-2"
import { Chart, ArcElement, CategoryScale, DoughnutController } from "chart.js"

Chart.register(ArcElement, CategoryScale, DoughnutController)

const defaultValidationSchema = yup.object().shape({
  title: yup.string().required().label("IP"),
})

const defaultInitialValues = {
  title: "",
}

const NmapForm = (props) => {
  const {
    initialValues = defaultInitialValues,
    validationSchema = defaultValidationSchema,
  } = props

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (values, { setSubmitting, resetForm }) => {
    setLoading(true)
    try {
      const response = await axios.post("/api/nmap", {
        ip: values.title,
      })
      setData(response.data)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setSubmitting(false)
      resetForm()
      setLoading(false)
    }
  }

  let openPorts = 0
  let closedPorts = 0
  let vulnerabilityScore = 0

  if (data) {
    openPorts = data.results.filter(
      (result) => result.status === "ouvert"
    ).length
    closedPorts = data.results.filter(
      (result) => result.status === "fermé"
    ).length

    if (openPorts + closedPorts > 0) {
      vulnerabilityScore = Math.round(
        (openPorts / (openPorts + closedPorts)) * 100
      )
    }
  }

  let colorClass = ""

  if (vulnerabilityScore < 50) {
    colorClass = "text-green-500"
  } else if (vulnerabilityScore < 75) {
    colorClass = "text-orange-500"
  } else {
    colorClass = "text-red-500"
  }

  const pieData = {
    labels: ["Ouvert", "Fermé"],
    datasets: [
      {
        data: [openPorts, closedPorts],
        backgroundColor: ["rgba(255,0,0,0.6)", "rgba(144,238,144,0.6)"],
        borderColor: ["rgba(255,0,0,0.6)", "rgba(144,238,144,0.6)"],
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Graphique de vulnérabilités",
      },
    },
  }

  return (
    <>
      <Formik
        onSubmit={onSubmit}
        initialValues={initialValues}
        validationSchema={validationSchema}
      >
        {({ values }) => (
          <Form className="flex-col p-2">
            <Formfield
              name="title"
              placeholder="Enter IP or HTTP url"
              label="IP or HTTP"
            />

            <button
              type="submit"
              className={`bg-green-500 rounded-xl text-white font-semibold px-8 py-1 mt-3 ${
                values.title === "" ? "bg-gray-400 cursor-not-allowed" : ""
              }`}
              disabled={values.title === ""}
            >
              Scan
            </button>
          </Form>
        )}
      </Formik>
      {loading ? (
        <p className="flex justify-center mt-12">Loading...</p>
      ) : data ? (
        <div className="ml-3">
          <div
            className={`w-full text-center p-4 rounded ${colorClass} mb-4 font-black`}
          >
            {`Score de vulnérabilité : ${vulnerabilityScore}%`}
          </div>

          <table className="table-auto border-collapse border-2 border-gray-500 mt-8 w-full">
            <thead>
              <tr>
                <th className="border-2 border-gray-400 px-4 py-2 text-gray-800">
                  PORT
                </th>
                <th className="border-2 border-gray-400 px-4 py-2 text-gray-800">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((result, index) => (
                <tr key={index}>
                  <td className="border-2 border-gray-400 px-4 py-2 text-gray-800">
                    {result.port}
                  </td>
                  <td className="border-2 border-gray-400 px-4 py-2 text-gray-800">
                    {result.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-16 h-64 w-64 relative left-[33%] flex flex-col gap-10 font-bold">
            <h1 className="flex justify-center">Graphique de vulnérabilités</h1>
            <Doughnut data={pieData} options={options} />
          </div>
        </div>
      ) : null}
    </>
  )
}

export default NmapForm
