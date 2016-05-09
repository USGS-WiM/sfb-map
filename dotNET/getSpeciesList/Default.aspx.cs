using System;
using System.Configuration;
using System.Collections;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Xml.Linq;
using System.Data.SqlClient;

namespace getSpeciesList
{
    public partial class _Default : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {

            Response.ContentType = "text/xml";
            Response.ContentEncoding = System.Text.Encoding.UTF8;
            
            string table_cd = Request.QueryString["table_cd"];
            ArrayList speciesID = new ArrayList();
            ArrayList speciesArray = new ArrayList();

            SqlConnection conn = new SqlConnection("Server=localhost\\SQLEXPRESS;Database=SFB;Integrated Security=True");

            SqlCommand comm = new SqlCommand("SELECT Species_ID FROM ComboSpecies WHERE Table_CD = '" + table_cd + "'", conn);

            conn.Open();
            SqlDataReader reader = comm.ExecuteReader();

            while (reader.Read())
            {
                speciesID.Add(reader["Species_ID"]);
            }

            reader.Close();

            int j;

            Response.Write("<?xml version='1.0'?>");
            Response.Write("<speciesList>");

            for (j = 0; j < speciesID.Count; j++)
            {
                SqlCommand comm3 = new SqlCommand("SELECT Species_Name, fact_sheet FROM Species_ID WHERE Species_ID = '" + speciesID[j] + "'", conn);

                SqlDataReader reader3 = comm3.ExecuteReader();
                
                while (reader3.Read())
                {
                    Response.Write("<species id='" + reader3["Species_Name"] + "'>");
                    Response.Write("<factsheet>" + reader3["fact_sheet"] + "</factsheet></species>");
                }
                reader3.Close();
            }

            SqlCommand comm4 = new SqlCommand("SELECT PDF FROM Table_CD WHERE Table_CD = '" + table_cd + "'", conn);

            SqlDataReader reader4 = comm4.ExecuteReader();

            while (reader4.Read())
            {
                Response.Write("<pdf>" + reader4["PDF"] + "</pdf>");
            }
            reader4.Close();

            Response.Write("</speciesList>");

            Response.End();
                    
            conn.Close();
        }
    }
}
